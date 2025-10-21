# Build stage
FROM node:24-bookworm AS builder
WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
COPY . .
RUN pnpm install

RUN pnpm run build

# Runtime stage
FROM node:24-bookworm
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]