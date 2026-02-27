# Build Stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Serving Stage
FROM nginx:alpine

# Copy built assets to NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom NGINX config if needed for React Router (SPA fallback)
# We will just write a default simple SPA configuration dynamically here
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
