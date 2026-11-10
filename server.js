require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
};

const databaseName = process.env.DB_NAME || 'user_app';
let pool;

// Validate the database name because SQL identifiers cannot be passed as ? parameters.
if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
  throw new Error('DB_NAME may contain only letters, numbers, and underscores.');
}

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: databaseName });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, created_at FROM users ORDER BY id DESC LIMIT 100'
    );
    res.json(rows);
  } catch (error) {
    console.error('Database read failed:', error.message);
    res.status(503).json({ error: 'Database read failed.' });
  }
});

app.post('/api/users', async (req, res) => {
  const username = req.body?.username;

  if (typeof username !== 'string' || username.trim().length < 1 || username.trim().length > 100) {
    return res.status(400).json({ error: 'Username must contain 1–100 characters.' });
  }

  try {
    const cleanName = username.trim();
    const [result] = await pool.execute(
      'INSERT INTO users (username) VALUES (?)',
      [cleanName]
    );
    res.status(201).json({
      id: result.insertId,
      username: cleanName,
      message: 'Username saved successfully.'
    });
  } catch (error) {
    console.error('Database write failed:', error.message);
    res.status(503).json({ error: 'Could not save username.' });
  }
});

async function initializeDatabase() {
  if (!dbConfig.host || !dbConfig.user || !dbConfig.password) {
    throw new Error('Set DB_HOST, DB_USER, and DB_PASSWORD in your .env file.');
  }

  // Connect to the RDS server without selecting a database first.
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    connectTimeout: dbConfig.connectTimeout
  });

  try {
    // Create the database if it does not already exist.
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    console.log(`Database "${databaseName}" is ready.`);
  } finally {
    await connection.end();
  }

  // Now connect to the newly created (or existing) database.
  pool = mysql.createPool({
    ...dbConfig,
    database: databaseName
  });

  // Create the users table automatically if it does not exist.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Table "users" is ready.');
}

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`App running on http://0.0.0.0:${PORT}`);
      console.log('Open the EC2 public IP in your browser to use the app.');
    });
  } catch (error) {
    console.error('Application startup failed:', error.message);
    console.error('Check your RDS endpoint, credentials, network access, and database-creation permissions.');
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  if (pool) await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (pool) await pool.end();
  process.exit(0);
});

startServer();
