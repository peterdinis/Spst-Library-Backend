# Dockerfile
FROM node:20-alpine

# Nastav pracovný adresár
WORKDIR /usr/src/app

# Skopíruj package.json a package-lock.json
COPY package*.json ./

# Inštalácia balíkov
RUN npm install

# Skopíruj zvyšok zdrojového kódu
COPY . .

# Prisma generate (iba na build)
RUN npx prisma generate

# Štart príkaz
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]