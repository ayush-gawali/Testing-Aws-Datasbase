-- Optional: server.js now creates this database and table automatically.
CREATE DATABASE IF NOT EXISTS user_app;
USE user_app;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
