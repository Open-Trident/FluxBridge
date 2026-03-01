<div align="center">

  <h1><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Bridge%20at%20Night.png" alt="Bridge at Night" width="50" height="50" style="vertical-align: middle"/> FluxBridge</h1>

  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=24&pause=1000&color=2563EB&center=true&vCenter=true&width=550&lines=A+Production-Ready+Relay+Platform;Real-Time+Minecraft+Command+Delivery;Dual-Mode+WebSocket+%2B+HTTP+Polling;Built+by+Open-Trident" alt="Typing SVG" />
  </a>

  <br />

  <p>
    <a href="https://github.com/Open-Trident/FluxBridge/stargazers">
      <img src="https://img.shields.io/github/stars/Open-Trident/FluxBridge?style=for-the-badge&logo=github&color=FFD700" alt="Stars" />
    </a>
    <a href="https://github.com/Open-Trident/FluxBridge/issues">
      <img src="https://img.shields.io/github/issues/Open-Trident/FluxBridge?style=for-the-badge&logo=github&color=E91E63" alt="Issues" />
    </a>
    <img src="https://img.shields.io/badge/Java-Paper_Plugin-E65100?style=for-the-badge&logo=java" alt="Java">
    <img src="https://img.shields.io/badge/Protocol-WebSocket%20%2F%20HTTP-00ACC1?style=for-the-badge&logo=socket.io" alt="Protocol">
    <img src="https://img.shields.io/badge/License-MIT-4CAF50?style=for-the-badge&logo=opensourceinitiative" alt="License">
  </p>

  <p><i>The ultimate developer-first solution for connecting global web stores to Minecraft server networks.</i></p>

</div>

<hr />

## 📖 Overview

**FluxBridge** is an enterprise-grade, highly scalable relay system architected by **Open-Trident**. It is designed to deliver commands from any central web platform or store backend to a fleet of Minecraft servers in real-time.

It features an intelligent **Dual-Mode Architecture** and an unbreakable **Offline Queueing System** that guarantees 100% command delivery, no matter the network conditions.

### 🏗️ Why FluxBridge?

Unlike closed ecosystems, FluxBridge is built for developers. We provide the unbreakable Minecraft plugin and a standardized JSON communication protocol. You can integrate this with your own custom backends in **Python**, **Node.js**, **PHP**, or **Go**, or deploy our provided examples straight out of the box!

<details>
<summary>📂 <b>View Repository Structure</b> <i>(Click to Expand)</i></summary>
<br>

1. **[Minecraft Plugin](./plugin/)** (`Java/Paper`): The highly optimized core plugin you drop into your server network.
2. **[Example Backend](./examples/backend/)** (`Node.js/Express/WS`): A fully functional production-ready backend integration.
3. **[Example Admin Dashboard](./examples/frontend/)** (`React/Vite/Tailwind`): A sleek, real-time tracking interface for your deliveries.

</details>

---

## ⚡ Core Features

- 🟢 **Dual-Mode Hybrid Networking:** Supports pure real-time WebSocket push mechanics (`wss://`), seamlessly falling back to HTTP Long-Polling (`/api/commands`) if the WebSocket connection drops out.
- 📦 **Offline Delivery Queue:** Commands destined for offline players are saved to a persistent, lightning-fast local `queue.yml`. They execute the millisecond the player logs back in.
- 🌐 **Developer First:** Connect any backend simply by speaking our JSON API/WebSocket spec. We don't lock you into a proprietary ecosystem.
- ⚙️ **Automated CI/CD:** Built-in `.github/workflows` test, compile, and automatically release `.jar` binaries upon pushing new version tags.

---

## 💻 Integration Examples

Integrating your application with FluxBridge is incredibly straightforward. Choose from **Real-Time WebSocket** push, or traditional **HTTP Polling**.

### 1. ⚡ WebSocket Push (Recommended)

When the FluxBridge plugin connects to your WebSocket server, it sends an authentication handshake. Upon success, you can stream commands in sub-millisecond real-time.

```javascript
// Example Node.js WebSocket Server
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    const json = JSON.parse(data);
    
    // 🔐 1. Authenticate the Plugin
    if (json.type === 'auth' && json.apiKey === 'YOUR_SECRET_KEY') {
      ws.send(JSON.stringify({ type: 'auth_success' }));
      
      // 🚀 2. Dispatch a command directly to the server
      ws.send(JSON.stringify({
        type: 'execute',
        commandId: 1001,
        playerName: 'Steve',
        command: 'give Steve diamond 64',
        requireOnline: true
      }));
    }
    
    // 📡 3. Listen for the Command Result
    if (json.type === 'result') {
      console.log(`✅ Command ${json.commandId} executed: ${json.status} -> ${json.message}`);
    }
  });
});
```

### 2. 🐢 HTTP Polling (Fallback/Traditional)

Don't want to use WebSockets? Provide an endpoint that the plugin hits every `X` seconds to retrieve the latest commands payload.

```javascript
// Example Express.js HTTP Endpoint
app.get('/api/server/commands', (req, res) => {
  // 🔐 Verify Credentials via Headers
  if (req.headers['authorization'] !== 'Bearer YOUR_SECRET_KEY') return res.sendStatus(401);

  // 📦 Return the commands payload array
  res.json([{
    id: 1002,
    player_name: "Steve",
    command: "msg Steve Hello from the web!",
    require_online: false
  }]);
});

// 📡 Endpoint for the plugin to POST execution results back to you
app.post('/api/server/result', express.json(), (req, res) => {
  const { commandId, status, message } = req.body;
  console.log(`✅ Command ${commandId} result: ${status} | ${message}`);
  res.sendStatus(200);
});
```

---

## 🚀 Quick Start (Running Examples)

If you'd like to get up and running immediately with our provided reference implementations:

1. **Start Backend**: `cd examples/backend && npm install && npm run start`
2. **Start Dashboard**: `cd examples/frontend && npm install && npm run dev`
3. **Compile Plugin**: Run `cd plugin && mvn clean package`, copy the `.jar` to your server's `plugins/` folder, and configure `config.yml` with the URL and credentials of your backend.

---

<div align="center">
  <h3>Built with ❤️ by</h3>
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png" alt="Laptop" width="35" height="35" style="vertical-align: middle"/>
  <a href="https://github.com/Open-Trident"><b>Open-Trident Organization</b></a>
</div>
