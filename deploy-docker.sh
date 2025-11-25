#!/bin/bash

echo "🚀 Docker Deployment Starting..."

set -e

docker compose down
docker compose build --no-cache
docker compose up -d

echo "✅ Deployment completed!"
docker compose ps
