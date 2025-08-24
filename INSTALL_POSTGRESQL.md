# Windows PostgreSQL 설치 가이드

## 1. PostgreSQL 다운로드 및 설치

### 다운로드
1. PostgreSQL 공식 사이트 접속: https://www.postgresql.org/download/windows/
2. "Download the installer" 클릭
3. Windows x86-64 버전 선택 (PostgreSQL 15 또는 16 권장)

### 설치 과정
1. 다운로드한 설치 파일 실행 (관리자 권한)
2. 설치 경로: 기본값 사용 (C:\Program Files\PostgreSQL\15)
3. 설치할 컴포넌트 선택:
   - [x] PostgreSQL Server
   - [x] pgAdmin 4
   - [x] Command Line Tools
   - [x] Stack Builder (선택사항)

4. **데이터베이스 설정**:
   - Data Directory: 기본값 사용
   - **Password 설정**: `qwer!234` (중요!)
   - Port: `5432` (기본값)
   - Locale: Korean, Korea

5. 설치 완료

## 2. 데이터베이스 및 사용자 생성

### pgAdmin 4 사용 방법
1. 시작 메뉴에서 pgAdmin 4 실행
2. 마스터 패스워드 설정 (처음 실행 시)
3. Servers > PostgreSQL 15 우클릭 > Connect
4. 패스워드 입력: `qwer!234`

### SQL로 데이터베이스 생성
1. pgAdmin에서 우클릭 > Query Tool 또는
2. 명령 프롬프트에서 psql 실행

다음 SQL 실행:
```sql
-- 데이터베이스 생성
CREATE DATABASE samsung_db;

-- 사용자 생성
CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024';

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user;

-- 스키마 권한 부여 (samsung_db에 연결 후 실행)
\c samsung_db
GRANT ALL ON SCHEMA public TO samsung_user;
```

## 3. 명령줄에서 데이터베이스 생성 (대안)

Windows 명령 프롬프트 (관리자 권한) 실행:

```batch
cd "C:\Program Files\PostgreSQL\15\bin"

# PostgreSQL 사용자로 로그인
psql -U postgres

# 패스워드 입력: qwer!234
```

SQL 명령어 입력:
```sql
CREATE DATABASE samsung_db;
CREATE USER samsung_user WITH PASSWORD 'samsung_pass_2024';
GRANT ALL PRIVILEGES ON DATABASE samsung_db TO samsung_user;
\q
```

## 4. 연결 테스트

```batch
psql -h localhost -U samsung_user -d samsung_db
# 패스워드: samsung_pass_2024
```

성공적으로 연결되면:
```
samsung_db=>
```

## 5. 환경변수 설정 (선택사항)

시스템 PATH에 PostgreSQL bin 디렉토리 추가:
1. 시스템 속성 > 고급 > 환경 변수
2. 시스템 변수 > Path > 편집
3. 새로 만들기: `C:\Program Files\PostgreSQL\15\bin`
4. 확인

이제 어디서든 `psql` 명령어 사용 가능

## 문제 해결

### PostgreSQL 서비스가 시작되지 않을 때
1. 서비스 관리자 열기 (services.msc)
2. "postgresql-x64-15" 찾기
3. 우클릭 > 시작
4. 시작 유형: 자동

### 포트 5432가 이미 사용 중일 때
1. 다른 포트 사용 (예: 5433)
2. .env 파일의 DATABASE_URL 수정:
```
DATABASE_URL="postgresql://samsung_user:samsung_pass_2024@localhost:5433/samsung_db?schema=public"
```