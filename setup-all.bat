@echo off
echo =====================================
echo Samsung Analysis 전체 설정 스크립트
echo =====================================
echo.
echo 이 스크립트는 다음 작업을 수행합니다:
echo 1. 데이터베이스 생성
echo 2. Prisma 스키마 적용
echo 3. 초기 데이터 입력
echo 4. 연결 테스트
echo.
pause

echo.
echo [1/4] 데이터베이스 생성 중...
echo =====================================
call setup-database.bat

if %ERRORLEVEL% NEQ 0 (
    echo 데이터베이스 생성 실패
    pause
    exit /b 1
)

echo.
echo [2/4] Prisma 스키마 적용 중...
echo =====================================
call npx prisma db push

if %ERRORLEVEL% NEQ 0 (
    echo Prisma 스키마 적용 실패
    pause
    exit /b 1
)

echo.
echo [3/4] 초기 데이터 입력 중...
echo =====================================
call npx tsx scripts/migrate-data.ts

if %ERRORLEVEL% NEQ 0 (
    echo 초기 데이터 입력 실패
    echo 계속 진행합니다...
)

echo.
echo [4/4] 연결 테스트 중...
echo =====================================
call node test-db-connection.js

echo.
echo =====================================
echo 설정 완료!
echo =====================================
echo.
echo 개발 서버를 시작하려면:
echo   npm run dev
echo.
echo 브라우저에서 접속:
echo   http://localhost:3000
echo.
echo 테스트 계정:
echo   Email: admin@samsung.com
echo   Password: admin123
echo =====================================
echo.
pause