# Používame oficiálny Node.js Alpine image
FROM node:20-alpine

# Nastavenie pracovného adresára
WORKDIR /usr/src/app

# Pridanie používateľa pre bezpečný zápis
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Inštalácia bash, git a ďalších potrebných nástrojov
RUN apk add --no-cache bash git

# Skopírovanie package súborov a inštalácia závislostí
COPY package*.json ./
RUN npm install

# Skopírovanie zdrojového kódu
COPY . .

# Prepneme na používateľa
USER appuser

# Defaultný príkaz (môže byť prepísaný v docker-compose)
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start:dev"]
