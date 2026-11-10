require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 3000);
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'user_app',
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
});

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, username, created_at FROM users ORDER BY id DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error('Database read failed:', err.message);
    res.status(503).json({ error: 'Database unavailable. Check the server configuration.' });
  }
});

app.post('/api/users', async (req, res) => {
  const username = req.body?.username;
  if (typeof username !== 'string' || username.trim().length < 1 || username.trim().length > 100) {
    return res.status(400).json({ error: 'Username must contain 1–100 characters.' });
  }
  try {
    const cleanName = username.trim();
    const [result] = await pool.execute('INSERT INTO users (username) VALUES (?)', [cleanName]);
    res.status(201).json({ id: result.insertId, username: cleanName });
  } catch (err) {
    console.error('Database write failed:', err.message);
    res.status(503).json({ error: 'Could not save username. Check database connectivity.' });
  }
});

app.listen(port, '0.0.0.0', () => console.log(`App running on http://localhost:${port}`));
