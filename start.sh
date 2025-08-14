#!/bin/bash
echo "Starting PM2 on port 80..."
pm2 start ecosystem.config.js --env production
echo "PM2 started successfully!"
