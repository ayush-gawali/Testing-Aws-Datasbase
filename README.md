# Node.js + AWS RDS MySQL User App (Automatic DB Setup)

## What is automatic?
When the app starts, `server.js`:
1. Connects to the MySQL server without selecting a database.
2. Runs `CREATE DATABASE IF NOT EXISTS` using `DB_NAME`.
3. Connects to that database.
4. Runs `CREATE TABLE IF NOT EXISTS users (...)`.
5. Starts the Express server only after database initialization succeeds.

## Requirements
- Node.js and npm on EC2
- Reachable AWS RDS MySQL endpoint
- A MySQL user that has permission to create databases and tables
- RDS security group allowing inbound TCP 3306 from the EC2 security group

## Setup
1. Extract this ZIP and enter the project folder.
2. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   nano .env
   ```
3. Set the real RDS endpoint, username, password and desired database name.
4. Install packages and start:
   ```bash
   npm install
   npm start
   ```

Default database name is `user_app`. The app creates the database and `users` table automatically if they do not exist.

## Important permissions
The RDS database user must be allowed to run `CREATE DATABASE` and `CREATE TABLE`. The RDS master user usually has the needed permissions. If you use a restricted database user, an administrator must grant the required privileges.

Automatic creation does not fix DNS, VPC, security-group, subnet, or incorrect-password problems. The EC2 instance must already be able to reach the RDS endpoint on port 3306.

## Test
- `GET /api/health` — database connection health
- `GET /api/users` — list saved usernames
- `POST /api/users` with JSON `{"username":"Alex"}` — save a username

Open `http://EC2_PUBLIC_IP:3000` in your browser after allowing inbound TCP 3000 from your own IP in the EC2 security group.

Do not commit `.env` to GitHub or share database credentials.
