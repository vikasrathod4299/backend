# Step 2: Build TS
FROM node:alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Run compiled code
FROM node:alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/.env .env

EXPOSE 8080

CMD ["node", "dist/src/index.js"]
