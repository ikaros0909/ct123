# Samsung Analysis - Windows PostgreSQL 설치 가이드

## 빠른 시작 가이드

### 1. PostgreSQL 설치 (Windows)

1. **다운로드**: https://www.postgresql.org/download/windows/
2. **설치**: 
   - PostgreSQL 15 또는 16 선택
   - 설치 중 비밀번호 설정: `qwer!234`
   - 포트: 5432 (기본값)

### 2. 프로젝트 설정

```batch
# 1. 프로젝트 디렉토리로 이동
cd D:\DevRoot\Samsung_Analysis

# 2. 패키지 설치
npm install

# 3. 자동 설정 실행 (postgres 비밀번호: qwer!234)
setup-database-auto.bat

# 또는 수동 설정 (비밀번호 직접 입력)
setup-all.bat
```

위 명령어가 자동으로 수행하는 작업:
- 데이터베이스 및 사용자 생성
- 테이블 스키마 생성
- 초기 데이터 입력
- 연결 테스트

### 3. 개발 서버 실행

```batch
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 개별 명령어

### 데이터베이스만 생성
```batch
setup-database.bat
```

### 스키마만 적용
```batch
npx prisma db push
```

### 초기 데이터만 입력
```batch
npx tsx scripts/migrate-data.ts
```

### 연결 테스트
```batch
node test-db-connection.js
```

### PostgreSQL 서비스 관리
```batch
postgresql-service.bat
```

## 데이터베이스 접속 정보

- **Host**: localhost
- **Port**: 5432
- **Database**: samsung_db
- **Username**: samsung_user
- **Password**: samsung_pass_2024

## 테스트 계정

- **관리자**
  - Email: admin@samsung.com
  - Password: admin123

- **일반 사용자**
  - Email: user@samsung.com
  - Password: user123

## 문제 해결

### "psql을 찾을 수 없음" 오류
1. PostgreSQL이 설치되었는지 확인
2. PATH 환경변수에 PostgreSQL bin 폴더 추가
   - 일반적 경로: `C:\Program Files\PostgreSQL\15\bin`

### "연결 거부" 오류
1. PostgreSQL 서비스가 실행 중인지 확인
   ```batch
   postgresql-service.bat
   ```
2. 옵션 4 선택하여 상태 확인

### "권한 거부" 오류
1. 배치 파일을 관리자 권한으로 실행
2. 파일 우클릭 → "관리자 권한으로 실행"

### 포트 5432가 이미 사용 중
1. 다른 PostgreSQL 인스턴스가 실행 중인지 확인
2. 필요시 포트 변경 (.env 파일 수정)

## pgAdmin 사용 (GUI 관리 도구)

1. 시작 메뉴에서 pgAdmin 4 실행
2. Servers → 우클릭 → Register → Server
3. 연결 정보 입력:
   - Name: Samsung DB
   - Host: localhost
   - Port: 5432
   - Database: samsung_db
   - Username: samsung_user
   - Password: samsung_pass_2024

## 데이터베이스 백업 및 복원

### 백업
```batch
pg_dump -U samsung_user -d samsung_db > backup.sql
```

### 복원
```batch
psql -U samsung_user -d samsung_db < backup.sql
```

## 추가 도구

### Prisma Studio (데이터 시각화)
```batch
npx prisma studio
```
브라우저에서 http://localhost:5555 접속

## 지원

문제가 발생하면:
1. `test-db-connection.js` 실행하여 연결 상태 확인
2. PostgreSQL 로그 확인: `C:\Program Files\PostgreSQL\15\data\log`
3. `.env` 파일의 DATABASE_URL 확인