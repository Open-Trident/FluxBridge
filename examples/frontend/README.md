# FluxBridge Admin Panel

The Admin Dashboard provides UI visibility into the real-time store execution network. Built natively in **React (Vite) + Tailwind CSS**.

## Structure
- `/src/pages/ServersPage.jsx` - Overview of Heartbeat signals, Active servers, API keys, and auto-generated identities.
- `/src/pages/CommandsLogPage.jsx` - Dynamic polling/view of all executions traversing the system (`PENDING`, `QUEUED`, `SUCCESS`, `FAILED`).
- `/src/pages/CreateCommandPage.jsx` - UI form to dispatch targeted test executions to specific servers and players via WebSocket push or HTTP Poll queue.

## Development
To start the development server:

```bash
npm install
npm run dev
```

The frontend runs locally on `http://localhost:5173`. Ensure the `backend` server is active on `port 3000` to prevent fetch failures.
