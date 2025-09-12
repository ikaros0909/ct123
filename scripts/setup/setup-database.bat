@echo off
echo ===================================
echo Samsung Analysis Database Setup
echo ===================================
echo.
echo PostgreSQL이 설치되어 있어야 합니다.
echo.

REM PostgreSQL 경로 설정 (버전에 따라 수정 필요)
set PSQL_PATH="C:\Program Files\PostgreSQL\15\bin\psql.exe"
set PG_PATH="C:\Program Files\PostgreSQL\16\bin\psql.exe"

REM psql 실행 파일 찾기
if exist %PSQL_PATH% (
    set PSQL=%PSQL_PATH%
) else if exist %PG_PATH% (
    set PSQL=%PG_PATH%
) else (
    REM PATH에 있는지 확인
    where psql >nul 2>&1
    if %ERRORLEVEL% == 0 (
        set PSQL=psql
    ) else (
        echo [오류] PostgreSQL이 설치되지 않았거나 PATH에 없습니다.
        echo.
        echo PostgreSQL 설치 방법:
        echo 1. https://www.postgresql.org/download/windows/ 접속
        echo 2. PostgreSQL 15 또는 16 다운로드 및 설치
        echo.
        pause
        exit /b 1
    )
)

echo PostgreSQL 찾음: %PSQL%
echo.

REM postgres 사용자 비밀번호 입력 안내
echo ===================================
echo 데이터베이스 생성을 시작합니다.
echo postgres 사용자 비밀번호를 입력하세요.
echo (설치 시 설정한 비밀번호: qwer!234)
echo ===================================
echo.

REM 데이터베이스 생성 SQL 파일 작성
echo -- Samsung Analysis Database Setup > temp_setup.sql
echo. >> temp_setup.sql
echo -- 기존 연결 종료 >> temp_setup.sql
echo SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'samsung_db' AND pid ^<^> pg_backend_pid(); >> temp_setup.sql
echo. >> temp_setup.sql
echo -- 데이터베이스 삭제 (존재하는 경우) >> temp_setup.sql
echo DROP DATABASE IF EXISTS samsung_db; >> temp_setup.sql
echo. >> temp_setup.sql
echo -- 사용자 삭제 (존재하는 경우) >> temp_setup.sql
echo DROP USER IF EXISTS samsung_user; >> temp_setup.sql
echo. >> temp_setup.sql
echo -- 사용자 생성 >> temp_setup.sql
echo CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024'; >> temp_setup.sql
echo. >> temp_setup.sql
echo -- 데이터베이스 생성 >> temp_setup.sql
echo CREATE DATABASE samsung_db OWNER samsung_user; >> temp_setup.sql
echo. >> temp_setup.sql
echo -- 권한 부여 >> temp_setup.sql
echo GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user; >> temp_setup.sql

REM SQL 실행
%PSQL% -U postgres -f temp_setup.sql

if %ERRORLEVEL% == 0 (
    echo.
    echo ===================================
    echo 데이터베이스 생성 완료!
    echo ===================================
    
    REM 스키마 권한 설정
    echo \c samsung_db > temp_grant.sql
    echo GRANT ALL ON SCHEMA public TO samsung_user; >> temp_grant.sql
    
    %PSQL% -U postgres -f temp_grant.sql
    
    REM 임시 파일 삭제
    del temp_setup.sql
    del temp_grant.sql
    
    echo.
    echo 데이터베이스 정보:
    echo - Host: localhost
    echo - Port: 5432
    echo - Database: samsung_db
    echo - Username: samsung_user
    echo - Password: samsung_pass_2024
    echo.
    echo ===================================
    echo 다음 단계:
    echo 1. npm run db:push (스키마 생성)
    echo 2. npm run db:seed (초기 데이터 입력)
    echo 3. npm run dev (개발 서버 실행)
    echo ===================================
) else (
    echo.
    echo [오류] 데이터베이스 생성 실패
    echo PostgreSQL이 실행 중인지 확인하세요.
    
    REM 임시 파일 삭제
    if exist temp_setup.sql del temp_setup.sql
    if exist temp_grant.sql del temp_grant.sql
)

echo.
pause