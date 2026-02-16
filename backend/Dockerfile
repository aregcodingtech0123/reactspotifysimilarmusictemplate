FROM node:18-alpine

# Prisma query engine needs OpenSSL at runtime (Alpine uses OpenSSL 3)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Prisma client oluştur
RUN npx prisma generate

# TypeScript'i derle (dist/server.js oluşur)
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]