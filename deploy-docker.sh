#!/bin/bash

echo "🚀 Docker Deployment Starting..."

set -e

git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ Deployment completed!"
docker-compose ps
