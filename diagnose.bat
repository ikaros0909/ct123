@echo off
echo ===================================
echo Database Connection Diagnostics
echo ===================================
echo.

echo 1. Checking PostgreSQL service...
sc query postgresql-x64-15 2>nul | find "RUNNING" >nul
if %ERRORLEVEL% == 0 (
    echo [OK] PostgreSQL 15 service is running
    goto :check_port
)

sc query postgresql-x64-16 2>nul | find "RUNNING" >nul
if %ERRORLEVEL% == 0 (
    echo [OK] PostgreSQL 16 service is running
    goto :check_port
)

echo [FAIL] PostgreSQL service is not running
echo.
echo Starting PostgreSQL service...
net start postgresql-x64-15 2>nul || net start postgresql-x64-16 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start service. Run as Administrator.
    pause
    exit /b 1
)

:check_port
echo.
echo 2. Checking port 5432...
netstat -an | findstr :5432 | findstr LISTENING >nul
if %ERRORLEVEL% == 0 (
    echo [OK] PostgreSQL is listening on port 5432
) else (
    echo [FAIL] PostgreSQL is not listening on port 5432
    echo Check PostgreSQL configuration
    pause
    exit /b 1
)

echo.
echo 3. Testing postgres connection...
set PGPASSWORD=qwer!234
psql -U postgres -h localhost -p 5432 -c "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Can connect as postgres user
) else (
    echo [FAIL] Cannot connect as postgres user
    echo Password might be wrong. Expected: qwer!234
    pause
    exit /b 1
)

echo.
echo 4. Checking database exists...
psql -U postgres -h localhost -l | findstr samsung_db >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Database samsung_db exists
) else (
    echo [FAIL] Database samsung_db does not exist
    echo Creating database...
    call create-db-simple.bat
)

echo.
echo 5. Testing samsung_user connection...
set PGPASSWORD=samsung_pass_2024
psql -U samsung_user -h localhost -d samsung_db -c "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] samsung_user can connect
) else (
    echo [FAIL] samsung_user cannot connect
    echo Run: fix-and-setup.bat
)

echo.
echo 6. Checking .env file...
if exist .env (
    echo [OK] .env file exists
    findstr "DATABASE_URL" .env >nul
    if %ERRORLEVEL% == 0 (
        echo [OK] DATABASE_URL is configured
    ) else (
        echo [FAIL] DATABASE_URL not found in .env
        echo.
        echo Add to .env:
        echo DATABASE_URL="postgresql://samsung_user:samsung_pass_2024@localhost:5432/samsung_db?schema=public"
    )
) else (
    echo [FAIL] .env file not found
    echo.
    echo Creating .env file...
    echo DATABASE_URL="postgresql://samsung_user:samsung_pass_2024@localhost:5432/samsung_db?schema=public" > .env
    echo NEXTAUTH_URL=http://localhost:3000 >> .env
    echo NEXTAUTH_SECRET=your-secret-key-change-this-in-production-2024 >> .env
    echo JWT_SECRET=your-jwt-secret-key-change-this-in-production-2024 >> .env
)

echo.
echo 7. Testing Prisma connection...
call npx prisma db pull --print >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Prisma can connect to database
) else (
    echo [FAIL] Prisma cannot connect
    echo.
    echo P1000 Error usually means:
    echo - Database server is not running
    echo - Wrong connection string
    echo - Firewall blocking connection
    echo - Wrong credentials
)

set PGPASSWORD=

echo.
echo ===================================
echo Diagnosis Complete
echo ===================================
echo.
echo If all checks pass but Prisma still fails:
echo 1. Run: fix-and-setup.bat
echo 2. Or manually run: npx prisma db push --accept-data-loss
echo.
pause