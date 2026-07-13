FROM node:18-slim

# Install system dependencies for headless browser execution if required
RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates procps libxss1 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]
