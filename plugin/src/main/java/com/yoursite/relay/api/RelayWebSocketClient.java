package com.yoursite.relay.api;

import com.yoursite.relay.RelayPlugin;
import com.yoursite.relay.model.RelayCommand;
import org.bukkit.Bukkit;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RelayWebSocketClient extends WebSocketClient {

    private final RelayPlugin plugin;

    public RelayWebSocketClient(RelayPlugin plugin, String url) throws URISyntaxException {
        super(new URI(url));
        this.plugin = plugin;
    }

    @Override
    public void onOpen(ServerHandshake handshakedata) {
        plugin.getLogger().info("WebSocket connected. Sending Auth...");
        
        // Send Auth payload
        String authJson = "{\"type\":\"auth\",\"serverId\":\"" + plugin.getServerId() + "\",\"apiKey\":\"" + plugin.getApiKey() + "\"}";
        send(authJson);
        
        // Stop polling if we were fallback-polling
        plugin.stopPolling();
    }

    @Override
    public void onMessage(String message) {
        // Expected formats:
        // {"type":"auth_success"}
        // {"type":"execute","commandId":25,"playerName":"Samir","command":"give Samir diamond 1","requireOnline":true}
        
        if (message.contains("\"type\":\"auth_success\"")) {
            plugin.getLogger().info("Successfully authenticated with FluxBridge WebSocket.");
            return;
        }

        if (message.contains("\"type\":\"execute\"")) {
            // Simplified JSON parsing
            Pattern pattern = Pattern.compile("\"commandId\":.*?([0-9a-fA-F-]+).*?\"playerName\":(?:null|\"(.*?)\|null).*?\"command\":\"(.*?)\".*?\"requireOnline\":(true|false)");
            Matcher matcher = pattern.matcher(message);

            if (matcher.find()) {
                String rawId = matcher.group(1).replaceAll("\"", "");
                int id = -1;
                try { id = Integer.parseInt(rawId); } catch (NumberFormatException e) { id = Math.abs(rawId.hashCode()); }
                String player = matcher.group(2).equals("null") ? null : matcher.group(2);
                String command = matcher.group(3);
                boolean requireOnline = Boolean.parseBoolean(matcher.group(4));

                RelayCommand cmd = new RelayCommand(id, player, command, requireOnline);
                
                // Execute on main thread
                Bukkit.getScheduler().runTask(plugin, () -> plugin.executeCommand(cmd));
            }
        }
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        plugin.getLogger().warning("WebSocket disconnected: " + reason);
        
        // Trigger auto-fallback to plugin main loop if enabled
        if (plugin.isAutoFallback()) {
            plugin.getLogger().warning("Auto-fallback enabled. Switching to Polling mode...");
            plugin.startPolling();
        }

        // Try reconnect logic (simple backoff not strictly required for MVP, but we can try reconnect sync task)
        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            if (plugin.getMode().equals("websocket") && !this.isOpen()) {
                plugin.startWebSocket();
            }
        }, 200L); // 10 seconds retry
    }

    @Override
    public void onError(Exception ex) {
        plugin.getLogger().severe("WebSocket Error: " + ex.getMessage());
    }

    public void sendResult(int commandId, String status, String message) {
        if (this.isOpen()) {
            String json = "{\"type\":\"result\",\"commandId\":\"" + commandId + "\",\"status\":\"" + status + "\",\"message\":\"" + message.replace("\"", "\\\"") + "\"}";
            send(json);
        } else {
            // Fallback to HTTP if WS closed while trying to send result
            plugin.getHttpClient().sendResult(commandId, status, message);
        }
    }
}
