FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for prisma CLI)
RUN npm ci

COPY --from=builder /app/dist ./dist

# Generate Prisma Client with the binary targets from schema.prisma
RUN npx prisma generate

# Remove dev dependencies
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]
