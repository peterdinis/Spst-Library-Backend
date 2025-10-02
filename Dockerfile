FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./

RUN npm install -g pnpm || npm install -g npm@latest

RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else npm ci --only=production; fi

COPY . .

RUN if [ -f pnpm-lock.yaml ]; then pnpm run build; else npm run build; fi

FROM node:18-alpine AS production

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./

RUN npm install -g pnpm || npm install -g npm@latest
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile --prod; else npm ci --only=production && npm cache clean --force; fi

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD [ "node", "healthcheck.js" ]

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/apps/library-backend-app/main.js"]
