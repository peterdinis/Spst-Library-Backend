FROM node:20-alpine

# Create app dir
WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN pnpm install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Expose app port
EXPOSE 3001

# Start NestJS
CMD ["pnpm", "run", "start:dev"]