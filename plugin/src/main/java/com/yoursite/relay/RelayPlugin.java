package com.yoursite.relay;

import org.bukkit.plugin.java.JavaPlugin;
import java.io.File;
import java.net.URI;
import java.net.URISyntaxException;

public class RelayPlugin extends JavaPlugin {

    private String serverId;
    private String apiKey;
    private String apiUrl;
    private String wsUrl;
    private String mode;
    private int pollInterval;
    private boolean autoFallback;

    @Override
    public void onEnable() {
        // Save default config.yml if it doesn't exist
        saveDefaultConfig();
        loadConfiguration();

        getLogger().info("FluxBridge has been enabled");
        getLogger().info("Server ID: " + serverId);
        getLogger().info("Mode: " + mode);
        
        // Ensure queue.yml exists
        File queueFile = new File(getDataFolder(), getConfig().getString("queue-save-file", "queue.yml"));
        if (!queueFile.exists()) {
            try {
                queueFile.createNewFile();
            } catch (Exception e) {
                getLogger().severe("Could not create queue.yml!");
            }
        }
        
        // TODO: Initialize QueueManager
        // TODO: Register PlayerJoinListener
        
        // Start clients based on mode
        startClients();
    }

    @Override
    public void onDisable() {
        // TODO: Shutdown clients gracefully
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
    }
    
    private void startClients() {
        if ("websocket".equals(mode)) {
            getLogger().info("Starting WebSocket Client...");
            // TODO: Start WebSocket
        } else {
            getLogger().info("Starting HTTP Polling Client...");
            // TODO: Start HTTP Polling task
        }
    }
    
    // Getters for configuration values
    public String getServerId() { return serverId; }
    public String getApiKey() { return apiKey; }
    public String getApiUrl() { return apiUrl; }
    public String getWsUrl() { return wsUrl; }
    public String getMode() { return mode; }
    public int getPollInterval() { return pollInterval; }
    public boolean isAutoFallback() { return autoFallback; }
}
