#!/bin/bash

# PM2 시작 스크립트
echo "🚀 CT123 애플리케이션을 PM2로 시작합니다..."

# 빌드 확인
if [ ! -d ".next" ]; then
    echo "📦 프로덕션 빌드를 시작합니다..."
    npm run build
fi

# PM2 시작
echo "🔄 PM2로 애플리케이션을 시작합니다..."
pm2 start ecosystem.config.js

# 상태 확인
echo "📊 애플리케이션 상태:"
pm2 status

echo "✅ 애플리케이션이 성공적으로 시작되었습니다!"
echo "🌐 접속 URL: http://localhost:3000"
echo "📝 로그 확인: npm run pm2:logs"
echo "🛑 중지: npm run pm2:stop"
