package com.yoursite.relay.updater;

import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

public class UpdateChecker {

    private final JavaPlugin plugin;
    private final String repoName; // e.g., "R-Samir-Bhuiyan-A/FluxBridge"

    public UpdateChecker(JavaPlugin plugin, String repoName) {
        this.plugin = plugin;
        this.repoName = repoName;
    }

    public void checkForUpdates() {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                URL githubUrl = new URL("https://api.github.com/repos/" + repoName + "/releases/latest");
                HttpURLConnection connection = (HttpURLConnection) githubUrl.openConnection();
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(5000);
                connection.setReadTimeout(5000);
                connection.setRequestProperty("Accept", "application/vnd.github.v3+json");
                // User-Agent is required by GitHub API
                connection.setRequestProperty("User-Agent", "FluxBridge-Update-Checker");

                if (connection.getResponseCode() == 200) {
                    try (InputStreamReader reader = new InputStreamReader(connection.getInputStream());
                         Scanner scanner = new Scanner(reader)) {
                        
                        StringBuilder response = new StringBuilder();
                        while (scanner.hasNext()) {
                            response.append(scanner.nextLine());
                        }

                        // Super simple JSON parsing to find "tag_name"
                        String json = response.toString();
                        String tagKey = "\"tag_name\":";
                        if (json.contains(tagKey)) {
                            int start = json.indexOf(tagKey) + tagKey.length();
                            start = json.indexOf("\"", start) + 1;
                            int end = json.indexOf("\"", start);
                            String latestVersion = json.substring(start, end);
                            
                            // Remove generic 'v' prefix if it exists
                            if (latestVersion.startsWith("v")) {
                                latestVersion = latestVersion.substring(1);
                            }

                            String currentVersion = plugin.getDescription().getVersion();
                            
                            if (currentVersion.startsWith("v")) {
                                currentVersion = currentVersion.substring(1);
                            }

                            if (!currentVersion.equalsIgnoreCase(latestVersion) && !currentVersion.contains("SNAPSHOT")) {
                                plugin.getLogger().warning("========================================");
                                plugin.getLogger().warning("A new version of FluxBridge is available!");
                                plugin.getLogger().warning("Current version: " + currentVersion);
                                plugin.getLogger().warning("Latest version: " + latestVersion);
                                plugin.getLogger().warning("Download it at: " + "https://github.com/" + repoName + "/releases/latest");
                                plugin.getLogger().warning("========================================");
                            } else {
                                plugin.getLogger().info("FluxBridge is up to date! (Version: " + currentVersion + ")");
                            }
                        }
                    }
                } else {
                    plugin.getLogger().warning("Failed to check for updates: GitHub API returned " + connection.getResponseCode());
                }
            } catch (Exception e) {
                plugin.getLogger().warning("Unable to check for updates: " + e.getMessage());
            }
        });
    }
}
