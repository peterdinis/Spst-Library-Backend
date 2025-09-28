# Multi-stage Dockerfile pre NestJS mikroslužby

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Nastavenie pracovného adresára
WORKDIR /app

# Kopírovanie package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Inštalácia pnpm ak sa používa, inak npm
RUN npm install -g pnpm || npm install -g npm@latest

# Inštalácia závislostí
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else npm ci --only=production; fi

# Kopírovanie zdrojového kódu
COPY . .

# Build aplikácie
RUN if [ -f pnpm-lock.yaml ]; then pnpm run build; else npm run build; fi

# Stage 2: Production stage
FROM node:18-alpine AS production

# Inštalácia dumb-init pre správne signal handling
RUN apk add --no-cache dumb-init

# Vytvorenie non-root užívateľa
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Nastavenie pracovného adresára
WORKDIR /app

# Kopírovanie package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Inštalácia iba production závislostí
RUN npm install -g pnpm || npm install -g npm@latest
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile --prod; else npm ci --only=production && npm cache clean --force; fi

# Kopírovanie built aplikácie z builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Nastavenie vlastníka súborov
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponovanie portu
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Spustenie aplikácie s dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/apps/library-backend-app/main.js"]