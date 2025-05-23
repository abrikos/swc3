FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM node:20-slim
WORKDIR /app
COPY --from=base /app/.output .
COPY package*.json ./
RUN npm install --omit=dev
EXPOSE 4004
CMD ["node", "server/index.mjs"]