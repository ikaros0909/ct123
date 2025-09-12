@echo off
echo =====================================
echo PostgreSQL 서비스 관리
echo =====================================
echo.
echo 1. PostgreSQL 서비스 시작
echo 2. PostgreSQL 서비스 중지
echo 3. PostgreSQL 서비스 재시작
echo 4. PostgreSQL 서비스 상태 확인
echo 5. 종료
echo.
set /p choice="선택하세요 (1-5): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto end

:start
echo.
echo PostgreSQL 서비스를 시작합니다...
net start postgresql-x64-15 2>nul || net start postgresql-x64-16 2>nul || (
    echo 관리자 권한이 필요합니다.
    echo 이 파일을 관리자 권한으로 실행하세요.
)
pause
goto end

:stop
echo.
echo PostgreSQL 서비스를 중지합니다...
net stop postgresql-x64-15 2>nul || net stop postgresql-x64-16 2>nul || (
    echo 관리자 권한이 필요합니다.
    echo 이 파일을 관리자 권한으로 실행하세요.
)
pause
goto end

:restart
echo.
echo PostgreSQL 서비스를 재시작합니다...
net stop postgresql-x64-15 2>nul || net stop postgresql-x64-16 2>nul
timeout /t 2 /nobreak > nul
net start postgresql-x64-15 2>nul || net start postgresql-x64-16 2>nul || (
    echo 관리자 권한이 필요합니다.
    echo 이 파일을 관리자 권한으로 실행하세요.
)
pause
goto end

:status
echo.
echo PostgreSQL 서비스 상태 확인 중...
sc query postgresql-x64-15 2>nul || sc query postgresql-x64-16 2>nul || (
    echo PostgreSQL 서비스를 찾을 수 없습니다.
    echo PostgreSQL이 설치되어 있는지 확인하세요.
)
echo.
netstat -an | findstr :5432
if %ERRORLEVEL% == 0 (
    echo.
    echo ✅ PostgreSQL이 포트 5432에서 실행 중입니다.
) else (
    echo.
    echo ⚠️  PostgreSQL이 포트 5432에서 실행되고 있지 않습니다.
)
pause
goto end

:end
exit /b 0