@echo off
chcp 949 > nul
echo ===================================
echo Samsung Analysis Database Setup
echo (Automatic Version)
echo ===================================
echo.

REM PostgreSQL path settings
set PSQL_PATH="C:\Program Files\PostgreSQL\15\bin\psql.exe"
set PG_PATH="C:\Program Files\PostgreSQL\16\bin\psql.exe"

REM Set postgres password
set PGPASSWORD=qwer!234

REM Find psql executable
if exist %PSQL_PATH% (
    set PSQL=%PSQL_PATH%
) else if exist %PG_PATH% (
    set PSQL=%PG_PATH%
) else (
    REM Check if in PATH
    where psql >nul 2>&1
    if %ERRORLEVEL% == 0 (
        set PSQL=psql
    ) else (
        echo [ERROR] PostgreSQL not found in PATH
        echo.
        echo Please install PostgreSQL:
        echo 1. Visit https://www.postgresql.org/download/windows/
        echo 2. Download PostgreSQL 15 or 16
        echo 3. Install with password: qwer!234
        echo.
        pause
        exit /b 1
    )
)

echo Found PostgreSQL: %PSQL%
echo.
echo Starting database creation...
echo.

REM Create SQL setup file
echo -- Samsung Analysis Database Setup > temp_setup.sql
echo. >> temp_setup.sql
echo -- Terminate existing connections >> temp_setup.sql
echo SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'samsung_db' AND pid ^<^> pg_backend_pid(); >> temp_setup.sql
echo. >> temp_setup.sql
echo -- Drop database if exists >> temp_setup.sql
echo DROP DATABASE IF EXISTS samsung_db; >> temp_setup.sql
echo. >> temp_setup.sql
echo -- Drop user if exists >> temp_setup.sql
echo DROP USER IF EXISTS samsung_user; >> temp_setup.sql
echo. >> temp_setup.sql
echo -- Create user >> temp_setup.sql
echo CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024'; >> temp_setup.sql
echo. >> temp_setup.sql
echo -- Create database >> temp_setup.sql
echo CREATE DATABASE samsung_db OWNER samsung_user; >> temp_setup.sql
echo. >> temp_setup.sql
echo -- Grant privileges >> temp_setup.sql
echo GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user; >> temp_setup.sql

REM Execute SQL with automatic password
%PSQL% -U postgres -h localhost -f temp_setup.sql

if %ERRORLEVEL% == 0 (
    echo.
    echo ===================================
    echo Database created successfully!
    echo ===================================
    
    REM Set schema permissions
    echo \c samsung_db > temp_grant.sql
    echo GRANT ALL ON SCHEMA public TO samsung_user; >> temp_grant.sql
    echo ALTER SCHEMA public OWNER TO samsung_user; >> temp_grant.sql
    echo GRANT CREATE ON SCHEMA public TO samsung_user; >> temp_grant.sql
    
    %PSQL% -U postgres -h localhost -f temp_grant.sql
    
    REM Delete temp files
    del temp_setup.sql
    del temp_grant.sql
    
    echo.
    echo Database Information:
    echo ===================================
    echo Host: localhost
    echo Port: 5432
    echo Database: samsung_db
    echo Username: samsung_user
    echo Password: samsung_pass_2024
    echo ===================================
    echo.
    echo PostgreSQL master password: qwer!234
    echo.
    echo Next steps:
    echo 1. npm run db:push (create schema)
    echo 2. npm run db:seed (migrate data)
    echo 3. npm run dev (start dev server)
    echo ===================================
) else (
    echo.
    echo [ERROR] Database creation failed
    echo.
    echo Possible causes:
    echo 1. PostgreSQL is not running
    echo 2. postgres password is not qwer!234
    echo 3. PostgreSQL is not using port 5432
    echo.
    echo Solutions:
    echo 1. Check if PostgreSQL service is running
    echo 2. Verify postgres password
    echo.
    
    REM Delete temp files
    if exist temp_setup.sql del temp_setup.sql
    if exist temp_grant.sql del temp_grant.sql
)

REM Clear password from environment
set PGPASSWORD=

echo.
pause