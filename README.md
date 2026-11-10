# Node.js + AWS RDS MySQL User Registry

## Setup
1. Install Node.js 20+ and npm.
2. `npm install`
3. Create a database/table using `schema.sql` (connect as a MySQL user with database creation permissions):
   `mysql -h YOUR_RDS_ENDPOINT -P 3306 -u admin -p < schema.sql`
4. Copy `.env.example` to `.env` and set the actual endpoint, database username, and password.
5. Run `npm start`.
6. Visit `http://localhost:3000`, or `http://YOUR_EC2_PUBLIC_IP:3000` if you explicitly allow inbound TCP 3000 from your IP in the EC2 security group.

## AWS network configuration
- RDS inbound TCP 3306: source = your EC2 security group (not 0.0.0.0/0).
- EC2 and RDS must have compatible VPC routes, network ACLs, and DNS resolution.
- If you see `Unknown MySQL server host`, verify the RDS endpoint copied from the RDS console and test `getent hosts YOUR_RDS_ENDPOINT` before retrying.
- Use HTTPS and authentication before exposing this demo publicly; the demo has no authentication or rate limiting.

## Files
- `server.js`: Express API and MySQL connection pool
- `public/index.html`: user form
- `public/style.css`: styles
- `public/script.js`: fetch API client
- `schema.sql`: database setup
- `.env.example`: environment variable template
