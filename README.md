# Samsung Analysis Dashboard

삼성전자 AI 분석 대시보드 - Next.js 기반 반응형 웹 애플리케이션

## 기능

- 📊 삼성전자 AI_H지수 분석 및 시각화
- 📱 모바일 및 PC 반응형 디자인
- 🎨 애플 디자인 시스템 기반 UI
- 🤖 GPT API를 통한 자동 분석
- 📈 실시간 차트 및 통계

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4 API

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일을 생성하고 OpenAI API 키를 설정하세요:
```
OPENAI_API_KEY=your_openai_api_key_here
```

3. 개발 서버 실행:
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## 프로젝트 구조

```
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # GPT 분석 API
│   │   ├── samsung-main/route.ts # 메인 데이터 API
│   │   └── samsung-analysis/route.ts # 분석 데이터 API
│   ├── globals.css               # 전역 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지
├── data/
│   ├── samsung_main.json         # 분석 항목 데이터
│   └── samsung_analysis.json     # 분석 결과 데이터
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 사용법

1. 날짜 선택: 원하는 분석 날짜를 선택합니다
2. AI 분석 실행: "AI 분석" 버튼을 클릭하여 GPT 분석을 시작합니다
3. 결과 확인: 차트와 테이블에서 분석 결과를 확인합니다

## 데이터 형식

### samsung_main.json
- 삼성전자 분석 항목들의 프롬프터와 가중치 정보
- 각 항목은 AI_H지수_프롬프터와 가중치를 포함

### samsung_analysis.json
- GPT 분석 결과 데이터
- 날짜별 AI_H지수 (-3~3)와 가중치 곱셈 결과

## 라이선스

MIT License 