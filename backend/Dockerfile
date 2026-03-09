FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

FROM base AS deps
COPY package.json ./
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY tsconfig.json .
COPY prisma ./prisma
COPY src ./src
RUN pnpm prisma generate && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
EXPOSE 4000
CMD ["node", "dist/server.js"]
