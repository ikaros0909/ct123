@echo off
echo Starting PostgreSQL database with Docker...
docker-compose up -d
echo.
echo Waiting for database to be ready...
timeout /t 5 /nobreak > nul
echo.
echo Database is ready!
echo.
echo PostgreSQL: localhost:5432
echo PgAdmin: http://localhost:5050
echo.
echo Database credentials:
echo   Database: samsung_db
echo   Username: samsung_user
echo   Password: samsung_pass_2024
echo.
echo PgAdmin credentials:
echo   Email: admin@samsung.local
echo   Password: admin_pass_2024
echo.