package com.yoursite.relay;

import com.yoursite.relay.api.HttpClient;
import com.yoursite.relay.api.RelayWebSocketClient;
import com.yoursite.relay.listener.PlayerJoinListener;
import com.yoursite.relay.model.RelayCommand;
import com.yoursite.relay.command.FluxBridgeCommand;
import com.yoursite.relay.queue.QueueManager;
import com.yoursite.relay.updater.UpdateChecker;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.net.URISyntaxException;

public class RelayPlugin extends JavaPlugin {

    private String serverId;
    private String apiKey;
    private String apiUrl;
    private String wsUrl;
    private String mode;
    private int pollInterval;
    private boolean autoFallback;
    private boolean debug;

    private QueueManager queueManager;
    private HttpClient httpClient;
    private RelayWebSocketClient webSocketClient;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        loadConfiguration();

        getLogger().info("FluxBridge has been enabled");
        getLogger().info("Server ID: " + serverId);
        getLogger().info("Mode: " + mode);
        
        // Run GitHub version check asynchronously and schedule it
        new UpdateChecker(this, "R-Samir-Bhuiyan-A/FluxBridge").start();
        
        File queueFile = new File(getDataFolder(), getConfig().getString("queue-save-file", "queue.yml"));
        if (!queueFile.exists()) {
            try { queueFile.createNewFile(); } catch (Exception e) { getLogger().severe("Could not create queue.yml!"); }
        }
        
        queueManager = new QueueManager(this);
        getServer().getPluginManager().registerEvents(new PlayerJoinListener(this, queueManager), this);
        
        getCommand("fluxbridge").setExecutor(new FluxBridgeCommand(this));
        
        httpClient = new HttpClient(this);
        
        startClients();
    }

    @Override
    public void onDisable() {
        if (webSocketClient != null && webSocketClient.isOpen()) {
            webSocketClient.close();
        }
        httpClient.stopPolling();
        getLogger().info("FluxBridge has been disabled");
    }

    private void loadConfiguration() {
        serverId = getConfig().getString("server-id");
        apiKey = getConfig().getString("api-key");
        apiUrl = getConfig().getString("api-url");
        wsUrl = getConfig().getString("ws-url");
        mode = getConfig().getString("mode", "websocket").toLowerCase();
        pollInterval = getConfig().getInt("poll-interval", 5);
        autoFallback = getConfig().getBoolean("auto-fallback", true);
        debug = getConfig().getBoolean("debug", false);
    }
    
    public void reloadPlugin() {
        if (webSocketClient != null && webSocketClient.isOpen()) {
            webSocketClient.close();
        }
        if (httpClient != null) {
            httpClient.stopPolling();
        }
        
        reloadConfig();
        loadConfiguration();
        
        getLogger().info("FluxBridge config reloaded. Switching to mode: " + mode);
        startClients();
    }
    
    private void startClients() {
        if ("websocket".equals(mode)) {
            getLogger().info("Starting WebSocket Client...");
            startWebSocket();
        } else {
            getLogger().info("Starting HTTP Polling Client...");
            startPolling();
        }
    }

    public void startWebSocket() {
        try {
            webSocketClient = new RelayWebSocketClient(this, wsUrl);
            webSocketClient.connect();
        } catch (URISyntaxException e) {
            getLogger().severe("Invalid WebSocket URL config: " + wsUrl);
        }
    }

    public void startPolling() {
        httpClient.startPolling();
    }

    public void stopPolling() {
        httpClient.stopPolling();
    }

    public void sendResult(int commandId, String status, String message) {
        if (webSocketClient != null && webSocketClient.isOpen()) {
            webSocketClient.sendResult(commandId, status, message);
        } else {
            httpClient.sendResult(commandId, status, message);
        }
    }

    public void executeCommand(RelayCommand cmd) {
        if (cmd.isRequireOnline() && cmd.getPlayerName() != null && !cmd.getPlayerName().isEmpty()) {
            Player p = Bukkit.getPlayer(cmd.getPlayerName());
            if (p == null || !p.isOnline()) {
                if (debug) {
                    getLogger().info("[DEBUG] Player " + cmd.getPlayerName() + " is offline. Queuing command...");
                }
                queueManager.queueCommand(cmd);
                
                // We'll mark as QUEUED inside the backend
                sendResult(cmd.getCommandId(), "QUEUED", "Player is offline, added to local queue");
                return;
            }
        }

        if (debug) {
            getLogger().info("[DEBUG] Executing command: /" + cmd.getCommand());
        }
        boolean success = Bukkit.dispatchCommand(Bukkit.getConsoleSender(), cmd.getCommand());
        
        sendResult(cmd.getCommandId(), "SUCCESS", success ? "Executed command successfully" : "Executed command, dispatched locally");
    }
    
    // Getters for configuration values
    public String getServerId() { return serverId; }
    public String getApiKey() { return apiKey; }
    public String getApiUrl() { return apiUrl; }
    public String getWsUrl() { return wsUrl; }
    public String getMode() { return mode; }
    public int getPollInterval() { return pollInterval; }
    public boolean isAutoFallback() { return autoFallback; }
    public HttpClient getHttpClient() { return httpClient; }
    public boolean isDebug() { return debug; }
}
