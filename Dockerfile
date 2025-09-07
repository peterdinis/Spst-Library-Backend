FROM node:20-alpine

# Nainštalovanie pnpm a udržanie npm
RUN npm install -g pnpm@latest

WORKDIR /usr/src/app

# Skopíruj package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Nainštaluj závislosti (preferuj pnpm ak existuje lock file)
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else npm install; fi

# Skopíruj zvyšok projektu
COPY . .

# Prisma client
RUN npx prisma generate

# Použij pnpm ak je dostupný, inak npm
CMD ["sh", "-c", "npx prisma migrate deploy && (command -v pnpm >/dev/null && pnpm run start:dev || npm run start:dev)"]