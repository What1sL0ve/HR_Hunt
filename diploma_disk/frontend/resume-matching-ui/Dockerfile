#############################
# 1️⃣ Build stage           #
#############################
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

#############################
# 2️⃣ Runtime stage (prod)  #
#############################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

# Устанавливаем прод-зависимости
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps

# Копируем собранный фронт и конфиг
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env* ./

EXPOSE 80

CMD ["npx", "next", "start", "-p", "80"]
