# Build stage
FROM node:24-bookworm AS builder
WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
COPY allnigeria_polling_units_with_coords.json ./
COPY . .
RUN pnpm install --frozen-lockfile

RUN pnpm run build

# Runtime stage
FROM node:24-bookworm
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/allnigeria_polling_units_with_coords.json ./
COPY package.json ./

# Set env + expose port
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
