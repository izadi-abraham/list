FROM oven/bun:1-alpine
WORKDIR /app

# Copy workspace manifests so bun install resolves the monorepo
COPY package.json bun.lock ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN bun install --production

# Copy source
COPY packages/shared packages/shared
COPY apps/api apps/api

WORKDIR /app/apps/api
EXPOSE 8080
CMD ["bun", "run", "src/index.ts"]
