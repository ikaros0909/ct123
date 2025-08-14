#!/bin/bash

# PM2 중지 스크립트
echo "🛑 CT123 애플리케이션을 중지합니다..."

# PM2 중지
pm2 stop ct123-app

# 상태 확인
echo "📊 애플리케이션 상태:"
pm2 status

echo "✅ 애플리케이션이 중지되었습니다!"
echo "🚀 다시 시작하려면: npm run pm2:start"
