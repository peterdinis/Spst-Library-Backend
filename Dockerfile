FROM node:20-alpine

WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install deps
RUN npm install

# Copy rest of app (excluding node_modules because of .dockerignore)
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]