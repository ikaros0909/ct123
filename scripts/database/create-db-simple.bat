@echo off
echo ===================================
echo Simple Database Creation
echo ===================================
echo.

set PGPASSWORD=qwer!234

echo Creating database and user...
echo.

psql -U postgres -h localhost -c "CREATE DATABASE samsung_db;" 2>nul
psql -U postgres -h localhost -c "CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024';" 2>nul
psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user;" 2>nul
psql -U postgres -h localhost -d samsung_db -c "GRANT ALL ON SCHEMA public TO samsung_user;" 2>nul
psql -U postgres -h localhost -d samsung_db -c "ALTER SCHEMA public OWNER TO samsung_user;" 2>nul

echo.
echo Database creation attempted.
echo.
echo Testing connection...
set PGPASSWORD=samsung_pass_2024
psql -U samsung_user -h localhost -d samsung_db -c "SELECT 'Connection successful' as status;"

if %ERRORLEVEL% == 0 (
    echo.
    echo [SUCCESS] Database is ready!
    echo.
    echo Database: samsung_db
    echo User: samsung_user  
    echo Password: samsung_pass_2024
) else (
    echo.
    echo [FAILED] Could not connect to database
    echo.
    echo Run test-postgres.bat to diagnose the issue
)

set PGPASSWORD=

echo.
pause