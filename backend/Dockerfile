FROM node:20

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install build tools needed for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Clean install dependencies from scratch
RUN rm -rf node_modules && \
    npm cache clean --force && \
    npm install --no-package-lock

# Install ts-node globally
RUN npm install -g ts-node typescript

# Copy source code
COPY . .

# Run the application
CMD ["npx", "ts-node", "src/server.ts"]
