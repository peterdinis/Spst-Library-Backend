FROM node:20-alpine

WORKDIR /usr/src/app

# Skopíruj len package.json a package-lock.json pre npm install
COPY package*.json ./

# Nainštaluj závislosti
RUN npm install

# Skopíruj zvyšok projektu, node_modules sa neprepíše vďaka .dockerignore
COPY . .

# Prisma client
RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]
