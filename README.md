# AI Corporate Competitiveness Diagnosis

삼성전자 AI 분석 대시보드 - AI 기반 기업 경쟁력 진단 시스템

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 모드 실행
```bash
npm run dev
```

### 3. 프로덕션 빌드
```bash
npm run build
npm start
```

## 📦 PM2로 프로덕션 실행

### PM2 설치 (전역)
```bash
npm install -g pm2
```

### PM2로 애플리케이션 실행
```bash
# 애플리케이션 시작
npm run pm2:start

# 또는 직접 PM2 명령어 사용
pm2 start scripts/pm2/ecosystem.config.js
```

### PM2 관리 명령어
```bash
# 상태 확인
npm run pm2:status
# 또는: pm2 status

# 로그 확인
npm run pm2:logs
# 또는: pm2 logs ct123-app

# 애플리케이션 재시작
npm run pm2:restart
# 또는: pm2 restart ct123-app

# 애플리케이션 중지
npm run pm2:stop
# 또는: pm2 stop ct123-app

# 애플리케이션 삭제
npm run pm2:delete
# 또는: pm2 delete ct123-app

# 모니터링 대시보드
npm run pm2:monit
# 또는: pm2 monit
```

### PM2 자동 시작 설정
```bash
# 시스템 부팅 시 자동 시작
pm2 startup
pm2 save
```

## 🔧 환경 변수 설정

### .env.local 파일 생성
```bash
# OpenAI API 키 (선택사항)
OPENAI_API_KEY=your_openai_api_key_here

# 포트 설정 (기본값: 3000)
PORT=3000
```

## 📁 프로젝트 구조

```
ct123/
├── app/                    # Next.js 앱 라우터
│   ├── api/               # API 라우트
│   ├── components/        # React 컴포넌트
│   ├── context/          # React Context
│   ├── lib/              # 유틸리티 함수
│   └── page.tsx          # 메인 페이지
├── data/                 # JSON 데이터 파일
├── logs/                 # PM2 로그 파일
├── ecosystem.config.js   # PM2 설정
├── package.json          # 프로젝트 설정
└── README.md            # 프로젝트 문서
```

## 🛠️ 개발 도구

### 개발 서버 실행
```bash
# 프론트엔드만
npm run dev:web

# API 서버만
npm run dev:api

# 전체 (프론트엔드 + API)
npm run dev:all
```

### 빌드 및 배포
```bash
# 전체 빌드
npm run build:all

# 전체 시작
npm run start:all
```

## 📊 주요 기능

- **AI 기반 기업 분석**: GPT-4o를 활용한 실시간 기업 경쟁력 분석
- **실시간 데이터 시각화**: 차트와 그래프를 통한 직관적인 데이터 표현
- **다국어 지원**: 한국어/영어 언어 전환
- **반응형 디자인**: 모바일/데스크톱 최적화
- **PM2 프로세스 관리**: 안정적인 프로덕션 운영

## 🔍 로그 확인

PM2 로그는 `logs/` 디렉토리에 저장됩니다:
- `logs/err.log`: 에러 로그
- `logs/out.log`: 출력 로그
- `logs/combined.log`: 통합 로그

## 🚨 문제 해결

### PM2 관련 문제
```bash
# PM2 프로세스 완전 삭제
pm2 delete all
pm2 kill

# PM2 재설치
npm install -g pm2

# 애플리케이션 재시작
pm2 start ecosystem.config.js
```

### 포트 충돌 문제
```bash
# 포트 사용 확인
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID <process_id> /F
```

## 📝 라이선스

© 2025 AI Corporate Competitiveness Diagnosis. All rights reserved. 