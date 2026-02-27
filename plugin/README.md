# FluxBridge Minecraft Plugin

A robust client plugin implementing a Dual-Mode Architecture for Spigot/Paper Minecraft servers.

## Modes

1. **WebSocket Mode (`mode: websocket`)**
   The preferred production configuration. Initiates a permanent connection to the Node API. The backend can dispatch real-time commands with zero latency upon creation.

2. **HTTP Polling Fallback**
   If the WebSocket is dropped (or if configured purely for polling via `mode: polling`), the plugin utilizes `poll-interval: 5` to actively scan the API for pending command queues.

## Offline Queue System
Commands structured with `require_online: true` will be validated. If the player is marked completely offline, the logic writes the `RelayCommand` definition locally into `queue.yml`. Once a `PlayerJoinEvent` successfully triggers for that username, the backlog executes and synchronously flushes the backend with a `SUCCESS` status via HTTP dispatcher.

## Compilation
We utilize Maven for dependency resolution (`paper-api` & `Java-WebSocket`) and shading.

```bash
# Clean binary builds of the .jar
mvn clean package
```
