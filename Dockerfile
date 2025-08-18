FROM node:20-alpine

# Create app dir
WORKDIR /app

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

USER appuser

CMD ["npm", "run", "start:dev"]
