# Use Node.js LTS
FROM node:20-alpine

# Create app dir
WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose app port
EXPOSE 3001

# Start NestJS
CMD ["npm", "run", "start:dev"]
