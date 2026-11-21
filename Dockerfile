FROM node:20-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV VITE_BASE_PATH=/
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server/index.js"]
