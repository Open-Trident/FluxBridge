package com.yoursite.relay.api;

import com.yoursite.relay.RelayPlugin;
import com.yoursite.relay.model.RelayCommand;
import org.bukkit.Bukkit;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class HttpClient {
    private final RelayPlugin plugin;
    private int pollingTaskId = -1;

    public HttpClient(RelayPlugin plugin) {
        this.plugin = plugin;
    }

    public void startPolling() {
        if (pollingTaskId != -1) return;
        
        int intervalTicks = plugin.getPollInterval() * 20;
        pollingTaskId = Bukkit.getScheduler().scheduleSyncRepeatingTask(plugin, () -> {
            fetchCommands();
            sendHeartbeat();
        }, intervalTicks, intervalTicks);
        plugin.getLogger().info("Started HTTP Polling task every " + plugin.getPollInterval() + " seconds.");
    }

    public void stopPolling() {
        if (pollingTaskId != -1) {
            Bukkit.getScheduler().cancelTask(pollingTaskId);
            pollingTaskId = -1;
            plugin.getLogger().info("Stopped HTTP Polling task.");
        }
    }

    public void fetchCommands() {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                URL url = new URL(plugin.getApiUrl() + "/server/commands");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Authorization", "Bearer " + plugin.getApiKey());
                conn.setRequestProperty("X-Server-Id", plugin.getServerId());
                conn.setRequestProperty("Content-Type", "application/json");

                int responseCode = conn.getResponseCode();
                if (responseCode == 200) {
                    Scanner scanner = new Scanner(url.openStream());
                    StringBuilder response = new StringBuilder();
                    while (scanner.hasNext()) {
                        response.append(scanner.nextLine());
                    }
                    scanner.close();

                    String jsonResponse = response.toString();
                    parseAndExecute(jsonResponse);
                } else {
                    plugin.getLogger().warning("Failed to fetch commands! Code: " + responseCode);
                }
            } catch (Exception e) {
                plugin.getLogger().warning("Error fetching commands via HTTP Polling: " + e.getMessage());
            }
        });
    }

    private void parseAndExecute(String jsonArray) {
        if (jsonArray.equals("[]")) return;

        // Very basic manual JSON parse for MVP purposes to avoid extra dependencies
        // Assuming format: [{"id":12,"player_name":"Samir","command":"give Samir diamond 1","require_online":true}]
        Pattern pattern = Pattern.compile("\\{\"id\":.*?([0-9a-fA-F-]+).*?\"player_name\":(?:null|\"(.*?)\"),\"command\":\"(.*?)\",\"require_online\":(true|false)\\}");
        Matcher matcher = pattern.matcher(jsonArray);

        while (matcher.find()) {
            String rawId = matcher.group(1).replaceAll("\"", "");
            int id = -1;
            try {
                id = Integer.parseInt(rawId);
            } catch (NumberFormatException e) {
                // If ID is mongo object id string, just hashing to int for local MVP use or keeping as -1
                id = Math.abs(rawId.hashCode()); 
            }
            
            String player = matcher.group(2);
            String command = matcher.group(3);
            boolean requireOnline = Boolean.parseBoolean(matcher.group(4));

            RelayCommand cmd = new RelayCommand(id, player, command, requireOnline);
            Bukkit.getScheduler().runTask(plugin, () -> plugin.executeCommand(cmd));
        }
    }

    public void sendResult(int commandId, String status, String message) {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                URL url = new URL(plugin.getApiUrl() + "/server/result");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Authorization", "Bearer " + plugin.getApiKey());
                conn.setRequestProperty("X-Server-Id", plugin.getServerId());
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                // Very basic JSON builder
                String jsonInputString = "{\"commandId\": \"" + commandId + "\", \"status\": \"" + status + "\", \"message\": \"" + message.replace("\"", "\\\"") + "\"}";

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                conn.getResponseCode();
            } catch (Exception e) {
                plugin.getLogger().warning("Error sending result: " + e.getMessage());
            }
        });
    }

    public void sendHeartbeat() {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                URL url = new URL(plugin.getApiUrl() + "/server/heartbeat");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Authorization", "Bearer " + plugin.getApiKey());
                conn.setRequestProperty("X-Server-Id", plugin.getServerId());
                conn.setRequestProperty("Content-Type", "application/json");

                conn.getResponseCode(); // Trigger request
            } catch (Exception e) {
                // Ignore silent heartbeat errors
            }
        });
    }
}
