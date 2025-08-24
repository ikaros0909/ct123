@echo off
chcp 949 > nul
echo =====================================
echo Samsung Analysis Auto Setup
echo =====================================
echo.
echo PostgreSQL postgres password: qwer!234
echo.
echo This script will automatically:
echo 1. Create database
echo 2. Apply Prisma schema
echo 3. Migrate initial data
echo 4. Test connection
echo.
pause

echo.
echo [1/4] Creating database...
echo =====================================
call setup-database-auto.bat

if %ERRORLEVEL% NEQ 0 (
    echo Database creation failed
    echo Check if postgres password is qwer!234
    pause
    exit /b 1
)

echo.
echo [2/4] Applying Prisma schema...
echo =====================================
call npx prisma db push

if %ERRORLEVEL% NEQ 0 (
    echo Prisma schema apply failed
    pause
    exit /b 1
)

echo.
echo [3/4] Migrating initial data...
echo =====================================
call npx tsx scripts/migrate-data.ts

if %ERRORLEVEL% NEQ 0 (
    echo Initial data migration failed
    echo Continuing...
)

echo.
echo [4/4] Testing connection...
echo =====================================
call node test-db-connection.js

echo.
echo =====================================
echo Setup Complete!
echo =====================================
echo.
echo To start dev server:
echo   npm run dev
echo.
echo Access in browser:
echo   http://localhost:3000
echo.
echo Database info:
echo   postgres master password: qwer!234
echo   samsung_user password: samsung_pass_2024
echo.
echo Test account:
echo   Email: admin@samsung.com
echo   Password: admin123
echo =====================================
echo.
pause