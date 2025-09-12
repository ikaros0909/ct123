# CT123 배포 가이드

## 사전 준비사항

1. Node.js 18.x 이상
2. PostgreSQL 14 이상
3. PM2 (프로세스 관리용)

## 배포 단계

### 1. 코드 배포
```bash
# 저장소 클론 또는 업데이트
git pull origin main

# 의존성 설치
npm install
```

### 2. 환경 변수 설정
`.env` 파일 생성:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ct123_db?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://your-domain.com"
OPENAI_API_KEY="your-openai-api-key"
```

### 3. 데이터베이스 설정

#### 신규 설치의 경우:
```bash
# 데이터베이스 생성
createdb ct123_db

# 마이그레이션 실행
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate

# 초기 데이터 시드 (선택사항)
npx prisma db seed
```

#### 기존 데이터베이스가 있는 경우:
```bash
# 스키마 동기화 확인
npx prisma migrate status

# 새로운 마이그레이션이 있다면 적용
npx prisma migrate deploy

# Prisma Client 재생성
npx prisma generate
```

### 4. 애플리케이션 빌드
```bash
# Next.js 프로덕션 빌드
npm run build
```

### 5. PM2로 실행
```bash
# PM2로 애플리케이션 시작
npm run pm2:start

# 또는
pm2 start scripts/pm2/ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs ct123-app
```

## 업데이트 배포

### 무중단 배포 (Zero-downtime deployment)
```bash
# 1. 코드 업데이트
git pull origin main
npm install

# 2. 데이터베이스 마이그레이션 (필요시)
npx prisma migrate deploy
npx prisma generate

# 3. 빌드
npm run build

# 4. PM2 재시작 (무중단)
pm2 reload ct123-app
```

## 문제 해결

### 마이그레이션 관련 문제

#### 1. "No migration found" 오류
```bash
# 현재 데이터베이스를 기준으로 초기 마이그레이션 생성
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/20250911000000_init/migration.sql
npx prisma migrate resolve --applied 20250911000000_init
```

#### 2. 스키마 동기화 문제
```bash
# 데이터베이스 스키마를 Prisma 스키마와 동기화
npx prisma db push
```

### PM2 관련 문제

#### 프로세스 재시작
```bash
pm2 restart ct123-app
```

#### 프로세스 중지
```bash
pm2 stop ct123-app
```

## 프로덕션 체크리스트

- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 연결 확인
- [ ] 마이그레이션 적용 완료
- [ ] Prisma Client 생성 완료
- [ ] Next.js 빌드 성공
- [ ] PM2 프로세스 실행 중
- [ ] 애플리케이션 접속 테스트

## 보안 고려사항

1. **환경 변수**: `.env` 파일을 절대 커밋하지 마세요
2. **시크릿 키**: 강력한 `NEXTAUTH_SECRET` 사용
3. **데이터베이스**: 강력한 비밀번호 사용
4. **방화벽**: 필요한 포트만 개방 (3000, 5432)
5. **HTTPS**: 프로덕션에서는 반드시 SSL/TLS 사용