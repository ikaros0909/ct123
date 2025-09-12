@echo off
echo ===================================
echo Prisma Setup Script
echo ===================================
echo.

REM Set postgres password
set PGPASSWORD=qwer!234

echo Step 1: Recreating database with proper permissions...
echo -----------------------------------------------------

REM Drop existing connections
psql -U postgres -h localhost -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'samsung_db' AND pid <> pg_backend_pid();" 2>nul

REM Drop and recreate
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS samsung_db;" 2>nul
psql -U postgres -h localhost -c "DROP USER IF EXISTS samsung_user;" 2>nul

REM Create user with proper permissions
psql -U postgres -h localhost -c "CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024' CREATEDB;" 
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create user
    pause
    exit /b 1
)

REM Create database
psql -U postgres -h localhost -c "CREATE DATABASE samsung_db OWNER samsung_user ENCODING 'UTF8';"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)

REM Grant all permissions
psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user;"
psql -U postgres -h localhost -c "ALTER DATABASE samsung_db OWNER TO samsung_user;"

REM Connect to database and set schema permissions
psql -U postgres -h localhost -d samsung_db -c "GRANT ALL ON SCHEMA public TO samsung_user;"
psql -U postgres -h localhost -d samsung_db -c "GRANT CREATE ON SCHEMA public TO samsung_user;"
psql -U postgres -h localhost -d samsung_db -c "ALTER SCHEMA public OWNER TO samsung_user;"
psql -U postgres -h localhost -d samsung_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO samsung_user;"
psql -U postgres -h localhost -d samsung_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO samsung_user;"
psql -U postgres -h localhost -d samsung_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO samsung_user;"
psql -U postgres -h localhost -d samsung_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO samsung_user;"

echo [OK] Database and permissions configured
echo.

REM Test connection as samsung_user
echo Step 2: Testing connection...
echo -----------------------------------------------------
set PGPASSWORD=samsung_pass_2024
psql -U samsung_user -h localhost -d samsung_db -c "SELECT current_user, current_database();" 
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Cannot connect as samsung_user
    pause
    exit /b 1
)

echo [OK] Connection successful
echo.

echo Step 3: Generating Prisma Client...
echo -----------------------------------------------------
call npx prisma generate

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Prisma generate failed
    pause
    exit /b 1
)

echo [OK] Prisma Client generated
echo.

echo Step 4: Pushing schema to database...
echo -----------------------------------------------------
call npx prisma db push --accept-data-loss

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Schema push failed
    echo.
    echo Trying with force reset...
    call npx prisma db push --force-reset
)

echo.
echo Step 5: Verifying tables...
echo -----------------------------------------------------
psql -U samsung_user -h localhost -d samsung_db -c "\dt"

echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo Database: samsung_db
echo User: samsung_user
echo Password: samsung_pass_2024
echo.
echo Tables created:
echo - User
echo - Company
echo - MainData
echo - Analysis
echo.
echo Next: npm run dev
echo.

set PGPASSWORD=
pause