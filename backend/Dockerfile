FROM node:20-alpine

WORKDIR /app

# Install dependencies first for caching layers
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose backend port
EXPOSE 3000

# Start server
CMD ["node", "src/index.js"]
