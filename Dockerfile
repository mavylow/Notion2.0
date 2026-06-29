FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY sidekick-monorepo-internship-backend-0.0.1.tgz ./

RUN npm ci

COPY . .

RUN npx msw init public --save

ENV NODE_ENV=production

RUN npm run build

# =========================

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/next.config.mjs ./next.config.mjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]