FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./ prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build && npx prisma generate

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system eventos && adduser --system eventos
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
USER eventos
EXPOSE 3005
CMD ["node", "dist/main"]
