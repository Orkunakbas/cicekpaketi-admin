#!/bin/bash

echo "🚀 CMS Deployment Starting..."

# 1. Dependencies kur
echo "📦 Installing dependencies..."
npm install

# 2. Admin dependencies kur
echo "📦 Installing admin dependencies..."
cd admin && npm install && cd ..

# 3. Next.js build al
echo "🏗️ Building Next.js admin panel..."
NODE_ENV=production npm run build

# 4. PM2 ile restart/start
echo "🔄 Starting/Restarting application..."
if pm2 list | grep -q "cms-app"; then
    NODE_ENV=production pm2 restart cms-app
else
    NODE_ENV=production pm2 start server.js --name "cms-app"
fi

# 5. PM2 durumunu göster
pm2 status

echo "✅ Deployment completed!"
echo "🌐 Application running on production mode"
echo "📊 Check: http://yourdomain.com/api/health"
echo "🎨 Admin: http://yourdomain.com/" 