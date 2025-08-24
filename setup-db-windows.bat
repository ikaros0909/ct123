@echo off
echo ================================================
echo Samsung Analysis Database Setup for Windows
echo ================================================
echo.

set PGPASSWORD=postgres123
set PGUSER=postgres
set PGHOST=localhost
set PGPORT=5432

echo Attempting to connect with default postgres password...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U %PGUSER% -h %PGHOST% -p %PGPORT% -c "SELECT version();" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Failed to connect with password: postgres123
    echo Please enter the correct postgres password:
    set /p PGPASSWORD=Password: 
)

echo.
echo Creating database and user...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U %PGUSER% -h %PGHOST% -p %PGPORT% -f fix-db-access.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo Database setup successful!
    echo ================================================
    echo.
    echo Now you can run: npx prisma db push
    echo.
) else (
    echo.
    echo ================================================
    echo Database setup failed!
    echo ================================================
    echo Please check the postgres password and try again.
    echo.
)

pause