# 배포 환경 API 오류 해결 가이드

## 문제 상황
- 로컬 환경: AI 분석 정상 작동 ✅
- 배포 환경: API가 HTML 응답 반환 ❌

## 1. 서버에서 확인할 사항

### 1.1 PM2 프로세스 상태 확인
```bash
pm2 status
pm2 logs ct123-app --lines 100
```

### 1.2 포트 확인
```bash
# Next.js가 실행 중인 포트 확인
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
```

### 1.3 Nginx 설정 확인
```bash
# 현재 Nginx 설정 확인
sudo nginx -t
sudo cat /etc/nginx/sites-enabled/ct123

# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/ct123_error.log
```

## 2. Nginx 설정 수정

### 2.1 설정 파일 백업
```bash
sudo cp /etc/nginx/sites-enabled/ct123 /etc/nginx/sites-enabled/ct123.backup
```

### 2.2 새 설정 적용
```bash
# nginx.conf 파일을 서버로 복사한 후
sudo cp nginx.conf /etc/nginx/sites-available/ct123
sudo ln -sf /etc/nginx/sites-available/ct123 /etc/nginx/sites-enabled/ct123

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

## 3. API 테스트

### 3.1 서버에서 직접 테스트
```bash
# 서버 내부에서 API 직접 호출
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"test": true}'

# 응답 확인
```

### 3.2 외부에서 테스트
```bash
# 외부에서 도메인으로 호출
curl -X POST http://ct123.kr/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"test": true}'
```

## 4. 환경 변수 확인

### 4.1 .env 파일 확인
```bash
cat .env
cat .env.local
```

필수 환경 변수:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL=http://ct123.kr` (중요!)
- `OPENAI_API_KEY`

### 4.2 PM2 환경 변수 확인
```bash
pm2 env ct123-app
```

## 5. Next.js 빌드 확인

### 5.1 빌드 로그 확인
```bash
npm run build
```

### 5.2 API 라우트 생성 확인
```bash
# .next 폴더에서 API 라우트 확인
ls -la .next/server/app/api/
ls -la .next/server/app/api/analyze/
```

## 6. 일반적인 해결 방법

### 6.1 캐시 클리어 및 재빌드
```bash
rm -rf .next
rm -rf node_modules/.cache
npm run build
pm2 restart ct123-app
```

### 6.2 Prisma 클라이언트 재생성
```bash
npx prisma generate
npm run build
pm2 restart ct123-app
```

### 6.3 미들웨어 확인
`middleware.ts` 파일이 API 라우트를 차단하지 않는지 확인

## 7. 디버깅 로그 추가

`/api/analyze/route.ts`에 다음 로그 추가:
```typescript
export async function POST(request: NextRequest) {
  console.log('[Analyze API] Request received');
  console.log('[Analyze API] Headers:', request.headers);
  console.log('[Analyze API] URL:', request.url);
  // ...
}
```

## 8. 임시 해결책

만약 위 방법들이 모두 실패한다면:

### 8.1 절대 URL 사용
```javascript
// Admin.tsx에서
const apiUrl = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:3000/api/analyze'  // 내부 직접 호출
  : '/api/analyze';
```

### 8.2 API 라우트 확인 엔드포인트 추가
```bash
# /api/health/route.ts 생성
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}
```

## 9. 로그 모니터링

다음 명령어로 실시간 모니터링:
```bash
# 터미널 1
pm2 logs ct123-app --lines 100 -f

# 터미널 2
sudo tail -f /var/log/nginx/ct123_error.log

# 터미널 3
sudo tail -f /var/log/nginx/ct123_access.log
```

## 10. 체크리스트

- [ ] PM2로 앱이 정상 실행 중인가?
- [ ] Nginx가 올바른 포트(3000)로 프록시하는가?
- [ ] API 라우트가 빌드되었는가?
- [ ] 환경 변수가 올바르게 설정되었는가?
- [ ] 데이터베이스 연결이 정상인가?
- [ ] Prisma 클라이언트가 생성되었는가?
- [ ] 미들웨어가 API를 차단하지 않는가?
- [ ] CORS 설정이 올바른가?

## 문제 해결 후

문제가 해결되면:
1. 원인을 문서화
2. 배포 스크립트 업데이트
3. 모니터링 설정 추가