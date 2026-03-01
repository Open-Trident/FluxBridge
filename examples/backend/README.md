# FluxBridge Backend

A robust Node.js server handling HTTP requests and WebSocket connections for the FluxBridge relay ecosystem.

## Environment Variables
Create a `.env` file referencing the sample:

```env
PORT=3000

# Backend Mode
DEFAULT_MODE=websocket

# Database Type: 'mongo' or 'sql'
DB_TYPE=sql

# SQL Config
SQL_CLIENT=mysql2
SQL_HOST=127.0.0.1
SQL_PORT=3306
SQL_USER=root
SQL_PASSWORD=
SQL_DATABASE=fluxbridge

# Mongo Config
MONGO_URI=mongodb://localhost:27017/fluxbridge
```

## Security & Auth
All plugin API routes are secured via middleware that expects:
- `X-Server-Id: <server-id>`
- `Authorization: Bearer <api-key>`

The WebSocket authenticates by initially expecting an `auth` JSON payload before allowing execution dispatches through the tunnel.
