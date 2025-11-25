# Admin Panel Dockerfile
FROM node:20-alpine

WORKDIR /app

# Dependencies yükle
COPY package*.json ./
RUN npm install

# Tüm dosyaları kopyala
COPY . .

# Build yap
RUN npm run build

# Port
EXPOSE 3001

# Start
CMD ["npm", "start"]


