FROM node:20-alpine AS development

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NODE_ENV=development

EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS production

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая TypeScript)
RUN npm ci

# Копируем исходный код
COPY . .

# Переменные ДО сборки!
ARG NEXT_PUBLIC_API_BASE_URL=https://verbify.icu/api/v1
ARG NEXT_PUBLIC_APP_NAME=Verbify
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

# Сборка приложения
RUN npm run build



EXPOSE 3000
CMD ["npm", "start"]