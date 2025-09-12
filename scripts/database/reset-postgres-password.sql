-- This script should be run as administrator in psql
-- Reset postgres password
ALTER USER postgres PASSWORD 'postgres123';

-- Create samsung_user if not exists
CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024';

-- Create database if not exists
CREATE DATABASE samsung_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user;

-- Connect to samsung_db
\c samsung_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO samsung_user;
GRANT CREATE ON SCHEMA public TO samsung_user;
ALTER DATABASE samsung_db OWNER TO samsung_user;