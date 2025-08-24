-- Run this as postgres user
-- psql -U postgres -h localhost

-- Drop and recreate user with superuser privileges temporarily
DROP USER IF EXISTS samsung_user;
CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024' SUPERUSER CREATEDB CREATEROLE;

-- Drop and recreate database
DROP DATABASE IF EXISTS samsung_db;
CREATE DATABASE samsung_db OWNER samsung_user;

-- Connect to samsung_db
\c samsung_db

-- Grant all permissions
GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user;
GRANT ALL ON SCHEMA public TO samsung_user;
ALTER SCHEMA public OWNER TO samsung_user;

-- Grant permissions for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO samsung_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO samsung_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO samsung_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TYPES TO samsung_user;

-- Test connection
\q