@echo off
echo ===================================
echo Fix and Setup Database
echo ===================================
echo.

echo Step 1: Testing PostgreSQL connection...
echo ----------------------------------------
set PGPASSWORD=qwer!234
psql -U postgres -h localhost -c "SELECT version();" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Cannot connect to PostgreSQL
    echo.
    echo Please check:
    echo 1. PostgreSQL service is running
    echo 2. Password is correct: qwer!234
    echo 3. PostgreSQL is on port 5432
    echo.
    echo Run: postgresql-service.bat
    pause
    exit /b 1
)

echo [OK] PostgreSQL is running
echo.

echo Step 2: Creating database and user...
echo ----------------------------------------

REM Drop and recreate everything
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS samsung_db;" 2>nul
psql -U postgres -h localhost -c "DROP USER IF EXISTS samsung_user;" 2>nul

psql -U postgres -h localhost -c "CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024';"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create user
    pause
    exit /b 1
)
echo [OK] User created

psql -U postgres -h localhost -c "CREATE DATABASE samsung_db OWNER samsung_user;"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)
echo [OK] Database created

psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user;"
echo [OK] Privileges granted

REM Additional permissions
psql -U postgres -h localhost -d samsung_db -c "GRANT ALL ON SCHEMA public TO samsung_user;" 2>nul
psql -U postgres -h localhost -d samsung_db -c "ALTER SCHEMA public OWNER TO samsung_user;" 2>nul
psql -U postgres -h localhost -d samsung_db -c "GRANT CREATE ON SCHEMA public TO samsung_user;" 2>nul

echo.
echo Step 3: Testing user connection...
echo ----------------------------------------
set PGPASSWORD=samsung_pass_2024
psql -U samsung_user -h localhost -d samsung_db -c "SELECT current_database(), current_user;" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] samsung_user cannot connect
    pause
    exit /b 1
)

echo [OK] samsung_user can connect
echo.

echo Step 4: Applying Prisma schema...
echo ----------------------------------------
call npx prisma db push --skip-generate

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Prisma schema failed
    echo.
    echo Check .env file has:
    echo DATABASE_URL="postgresql://samsung_user:samsung_pass_2024@localhost:5432/samsung_db?schema=public"
    pause
    exit /b 1
)

echo [OK] Prisma schema applied
echo.

echo Step 5: Generating Prisma Client...
echo ----------------------------------------
call npx prisma generate

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Prisma client generation failed
    pause
    exit /b 1
)

echo [OK] Prisma client generated
echo.

echo Step 6: Migrating initial data...
echo ----------------------------------------
call npx tsx scripts/migrate-data.ts

if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Data migration failed (optional)
    echo Continuing...
)

echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo Database: samsung_db
echo User: samsung_user
echo Password: samsung_pass_2024
echo.
echo Run: npm run dev
echo.

set PGPASSWORD=
pause