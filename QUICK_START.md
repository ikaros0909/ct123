# 🚀 빠른 시작 가이드

## PostgreSQL 설치 완료 후

### 자동 설정 (권장)
postgres 비밀번호가 `qwer!234`인 경우:

```batch
# 1. 자동으로 모든 설정 완료
setup-all-auto.bat

# 2. 개발 서버 실행
npm run dev
```

### 수동 설정
postgres 비밀번호를 직접 입력하려면:

```batch
# 1. 데이터베이스 생성 (비밀번호 입력 필요)
setup-database.bat

# 2. 스키마 생성
npx prisma db push

# 3. 초기 데이터 입력
npx tsx scripts/migrate-data.ts

# 4. 개발 서버 실행
npm run dev
```

## 접속 정보

### 웹 애플리케이션
- URL: http://localhost:3000
- 테스트 계정: admin@samsung.com / admin123

### PostgreSQL
- **postgres (마스터)**: qwer!234
- **samsung_user**: samsung_pass_2024
- **데이터베이스**: samsung_db

## 문제 발생 시

### 연결 테스트
```batch
node test-db-connection.js
```

### PostgreSQL 서비스 확인
```batch
postgresql-service.bat
```

### 데이터베이스 재생성
```batch
setup-database-auto.bat
```