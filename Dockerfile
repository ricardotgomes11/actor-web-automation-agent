FROM node:18-slim

# Install core runtime dependencies for headless browser operations
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Leverage build caching for node modules
COPY package*.json ./
RUN npm ci

# Copy source files and build the production artifact
COPY . .
RUN npm run build

# Prune development dependencies to keep the cloud footprint minimal
RUN npm prune --production

EXPOSE 8080
ENV PORT=8080

CMD ["node", "dist/server.js"]
