@echo off
echo ===================================
echo PostgreSQL Connection Test
echo ===================================
echo.

REM PostgreSQL path settings
set PSQL_PATH="C:\Program Files\PostgreSQL\15\bin\psql.exe"
set PG_PATH="C:\Program Files\PostgreSQL\16\bin\psql.exe"

REM Find psql
if exist %PSQL_PATH% (
    set PSQL=%PSQL_PATH%
) else if exist %PG_PATH% (
    set PSQL=%PG_PATH%
) else (
    where psql >nul 2>&1
    if %ERRORLEVEL% == 0 (
        set PSQL=psql
    ) else (
        echo [ERROR] PostgreSQL not found
        pause
        exit /b 1
    )
)

echo Testing connections...
echo.

echo 1. Testing postgres user connection:
echo Password: qwer!234
set PGPASSWORD=qwer!234
%PSQL% -U postgres -h localhost -c "SELECT version();" 2>&1

if %ERRORLEVEL% == 0 (
    echo [OK] postgres user connection successful
) else (
    echo [FAIL] postgres user connection failed
    echo Check if password is correct: qwer!234
)

echo.
echo 2. Testing samsung_db database existence:
%PSQL% -U postgres -h localhost -c "SELECT datname FROM pg_database WHERE datname = 'samsung_db';" 2>&1

echo.
echo 3. Testing samsung_user existence:
%PSQL% -U postgres -h localhost -c "SELECT usename FROM pg_user WHERE usename = 'samsung_user';" 2>&1

echo.
echo 4. Testing samsung_user connection:
set PGPASSWORD=samsung_pass_2024
%PSQL% -U samsung_user -h localhost -d samsung_db -c "SELECT current_database(), current_user;" 2>&1

if %ERRORLEVEL% == 0 (
    echo [OK] samsung_user can connect to samsung_db
) else (
    echo [FAIL] samsung_user cannot connect to samsung_db
    echo Database or user may not exist
)

echo.
echo 5. Checking PostgreSQL service status:
sc query postgresql-x64-15 2>nul || sc query postgresql-x64-16 2>nul || echo PostgreSQL service not found

echo.
echo 6. Checking port 5432:
netstat -an | findstr :5432
if %ERRORLEVEL% == 0 (
    echo [OK] PostgreSQL is listening on port 5432
) else (
    echo [FAIL] PostgreSQL is not listening on port 5432
)

set PGPASSWORD=

echo.
echo ===================================
echo Test Complete
echo ===================================
pause