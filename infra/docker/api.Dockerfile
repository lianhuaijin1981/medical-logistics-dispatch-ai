FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS runner
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["pnpm", "dev:api"]
