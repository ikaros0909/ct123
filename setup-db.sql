-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'samsung_user') THEN
      CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024';
   END IF;
END
$do$;

-- Create database if not exists
SELECT 'CREATE DATABASE samsung_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'samsung_db')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user;

-- Connect to samsung_db
\c samsung_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO samsung_user;
GRANT CREATE ON SCHEMA public TO samsung_user;