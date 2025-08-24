@echo off
echo ===================================
echo Samsung Analysis Database Setup
echo ===================================
echo.
echo 이 스크립트는 테스트 환경을 설정합니다.
echo.
echo 1. Docker Desktop을 먼저 설치하고 실행하세요.
echo    다운로드: https://www.docker.com/products/docker-desktop
echo.
echo 2. Docker가 실행된 후 아래 명령어를 실행하세요:
echo.
echo    # PostgreSQL 시작
echo    docker-compose up -d
echo.
echo    # 데이터베이스 스키마 생성
echo    npx prisma db push
echo.
echo    # 초기 데이터 마이그레이션
echo    npx tsx scripts/migrate-data.ts
echo.
echo 3. 개발 서버 실행
echo    npm run dev
echo.
echo ===================================
echo 테스트 계정 정보:
echo Email: admin@samsung.com
echo Password: admin123
echo ===================================
pause