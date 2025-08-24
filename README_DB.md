# Samsung Analysis - PostgreSQL 기반 재개발 가이드

## 시스템 구성

### 기술 스택
- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT 기반 인증
- **Container**: Docker & Docker Compose

## 설치 및 실행 가이드

### 1. 사전 요구사항
- Node.js 18.x 이상
- Docker Desktop 설치
- Git

### 2. PostgreSQL 데이터베이스 시작

```bash
# Docker로 PostgreSQL 시작
start-db.bat

# 또는 Docker Compose 직접 실행
docker-compose up -d
```

### 3. 데이터베이스 초기화

```bash
# Prisma 스키마 푸시
npm run db:push

# 기존 데이터 마이그레이션
npm run db:seed

# 또는 한번에 실행
npm run db:setup
```

### 4. 애플리케이션 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

## 데이터베이스 접속 정보

### PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: samsung_db
- **Username**: samsung_user
- **Password**: samsung_pass_2024

### PgAdmin (웹 기반 DB 관리 도구)
- **URL**: http://localhost:5050
- **Email**: admin@samsung.local
- **Password**: admin_pass_2024

## 기본 관리자 계정

- **Email**: admin@samsung.com
- **Password**: admin123

## 주요 기능

### 1. 인증 시스템
- 회원가입 (`/api/auth/register`)
- 로그인 (`/api/auth/login`)
- JWT 토큰 기반 인증
- 사용자/관리자 권한 구분

### 2. 데이터 관리
- 회사 정보 관리
- 분석 데이터 저장 및 조회
- 메인 데이터 관리

### 3. API 엔드포인트

#### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

#### 회사
- `GET /api/companies` - 회사 목록 조회
- `POST /api/companies` - 회사 추가 (관리자)

#### 메인 데이터
- `GET /api/main-data` - 메인 데이터 조회
- `POST /api/main-data` - 메인 데이터 추가

#### 분석 데이터
- `GET /api/analysis-data` - 분석 데이터 조회
- `POST /api/analysis-data` - 분석 데이터 추가

## 데이터베이스 스키마

### Users 테이블
- id (Primary Key)
- email (Unique)
- password (Hashed)
- name
- role (USER/ADMIN)
- createdAt
- updatedAt
- lastLoginAt

### Companies 테이블
- id (Primary Key)
- name (Unique)
- nameKr
- description
- createdAt
- updatedAt

### MainData 테이블
- id (Primary Key)
- companyId (Foreign Key)
- category
- sequenceNumber
- aiPrompter
- weight
- field
- userId (Foreign Key)
- createdAt
- updatedAt

### Analysis 테이블
- id (Primary Key)
- companyId (Foreign Key)
- date
- aiIndex
- weightedIndex
- sequenceNumber
- category
- field
- userId (Foreign Key)
- createdAt
- updatedAt

## 문제 해결

### Docker가 실행되지 않을 때
1. Docker Desktop이 실행 중인지 확인
2. Windows의 경우 WSL2가 설치되어 있는지 확인

### 데이터베이스 연결 실패
1. PostgreSQL 컨테이너가 실행 중인지 확인: `docker ps`
2. 포트 5432가 이미 사용 중인지 확인
3. `.env.local` 파일의 DATABASE_URL 확인

### 마이그레이션 오류
1. 데이터베이스가 실행 중인지 확인
2. 기존 테이블 삭제 후 재실행: `npx prisma db push --force-reset`

## 개발 팁

### Prisma Studio 사용
```bash
npx prisma studio
```
웹 브라우저에서 데이터베이스를 시각적으로 관리할 수 있습니다.

### 데이터베이스 백업
```bash
docker exec samsung-postgres pg_dump -U samsung_user samsung_db > backup.sql
```

### 데이터베이스 복원
```bash
docker exec -i samsung-postgres psql -U samsung_user samsung_db < backup.sql
```

## 보안 주의사항

1. 프로덕션 환경에서는 반드시 환경변수 값들을 변경하세요
2. JWT_SECRET과 NEXTAUTH_SECRET은 강력한 랜덤 문자열로 변경
3. 데이터베이스 비밀번호 변경
4. HTTPS 사용 권장