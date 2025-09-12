@echo off
echo ===================================
echo Fixing Database Permissions
echo ===================================
echo.

set PGPASSWORD=qwer!234

echo Granting SUPERUSER to samsung_user...
psql -U postgres -h localhost -c "ALTER USER samsung_user WITH SUPERUSER CREATEDB;"

if %ERRORLEVEL% == 0 (
    echo [OK] Permissions granted
) else (
    echo Creating user with SUPERUSER...
    psql -U postgres -h localhost -c "DROP USER IF EXISTS samsung_user;"
    psql -U postgres -h localhost -c "CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024' SUPERUSER CREATEDB;"
)

echo.
echo Recreating database...
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS samsung_db;"
psql -U postgres -h localhost -c "CREATE DATABASE samsung_db OWNER samsung_user;"

echo.
echo Setting permissions...
psql -U postgres -h localhost -d samsung_db -c "GRANT ALL ON SCHEMA public TO samsung_user;"
psql -U postgres -h localhost -d samsung_db -c "ALTER SCHEMA public OWNER TO samsung_user;"

echo.
echo Testing connection...
set PGPASSWORD=samsung_pass_2024
psql -U samsung_user -h localhost -d samsung_db -c "SELECT 'Connected as ' || current_user || ' to ' || current_database() as status;"

if %ERRORLEVEL% == 0 (
    echo.
    echo [SUCCESS] Permissions fixed!
    echo.
    echo Now run: npx prisma db push
) else (
    echo.
    echo [FAILED] Still cannot connect
)

set PGPASSWORD=
pause