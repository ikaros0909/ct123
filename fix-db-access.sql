-- Run this script as postgres superuser
-- This will properly set up the database and user with correct permissions

-- Drop existing connections to the database
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'samsung_db' AND pid <> pg_backend_pid();

-- Drop database if exists (to start fresh)
DROP DATABASE IF EXISTS samsung_db;

-- Drop user if exists
DROP USER IF EXISTS samsung_user;

-- Create user with proper permissions
CREATE USER samsung_user WITH 
    PASSWORD 'samsung_pass_2024'
    CREATEDB
    LOGIN;

-- Create database with samsung_user as owner
CREATE DATABASE samsung_db 
    WITH OWNER = samsung_user
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

-- Connect to the database
\c samsung_db

-- Grant all privileges on schema
GRANT ALL ON SCHEMA public TO samsung_user;
GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user;

-- Ensure samsung_user can create tables
ALTER SCHEMA public OWNER TO samsung_user;

-- Grant usage and create privileges
GRANT USAGE, CREATE ON SCHEMA public TO samsung_user;

-- Final check
\du samsung_user
\l samsung_db