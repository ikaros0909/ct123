@echo off
echo Stopping PostgreSQL service...
net stop postgresql-x64-17

echo.
echo Setting PostgreSQL to trust authentication temporarily...
echo.
echo Please manually edit pg_hba.conf file at:
echo C:\Program Files\PostgreSQL\17\data\pg_hba.conf
echo.
echo Change this line:
echo   host    all             all             127.0.0.1/32            scram-sha-256
echo To:
echo   host    all             all             127.0.0.1/32            trust
echo.
echo Also change:
echo   host    all             all             ::1/128                 scram-sha-256
echo To:
echo   host    all             all             ::1/128                 trust
echo.
pause

echo Starting PostgreSQL service...
net start postgresql-x64-17

echo.
echo Now connecting to reset password...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -c "ALTER USER postgres PASSWORD 'postgres123';"

echo.
echo Password changed to: postgres123
echo.
echo Now change pg_hba.conf back to scram-sha-256 authentication
pause

net stop postgresql-x64-17
net start postgresql-x64-17

echo Done!