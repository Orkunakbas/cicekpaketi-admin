# Backend API Dockerfile
FROM node:20-alpine

WORKDIR /app

# Dependencies yükle
COPY package*.json ./
RUN npm install --production

# Tüm dosyaları kopyala (admin hariç)
COPY . .
RUN rm -rf admin

# Port
EXPOSE 3000

# Start
CMD ["node", "server.js"]


