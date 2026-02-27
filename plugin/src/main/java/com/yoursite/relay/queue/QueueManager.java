package com.yoursite.relay.queue;

import com.yoursite.relay.RelayPlugin;
import com.yoursite.relay.model.RelayCommand;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class QueueManager {
    private final RelayPlugin plugin;
    private final File queueFile;
    private FileConfiguration queueConfig;

    public QueueManager(RelayPlugin plugin) {
        this.plugin = plugin;
        this.queueFile = new File(plugin.getDataFolder(), plugin.getConfig().getString("queue-save-file", "queue.yml"));
        loadQueue();
    }

    private void loadQueue() {
        if (!queueFile.exists()) {
            try {
                queueFile.createNewFile();
            } catch (IOException e) {
                plugin.getLogger().severe("Could not create queue.yml!");
            }
        }
        queueConfig = YamlConfiguration.loadConfiguration(queueFile);
    }

    public synchronized void queueCommand(RelayCommand command) {
        if (command.getPlayerName() == null || command.getPlayerName().isEmpty()) {
            plugin.getLogger().warning("Tried to queue a command without a player name! ID: " + command.getCommandId());
            return;
        }

        String target = command.getPlayerName().toLowerCase();
        List<Map<String, Object>> playerQueue = (List<Map<String, Object>>) queueConfig.getList(target);
        
        if (playerQueue == null) {
            playerQueue = new ArrayList<>();
        }

        Map<String, Object> serializedCmd = new HashMap<>();
        serializedCmd.put("id", command.getCommandId());
        serializedCmd.put("command", command.getCommand());
        playerQueue.add(serializedCmd);

        queueConfig.set(target, playerQueue);
        saveQueue();
    }

    public synchronized List<RelayCommand> getQueuedCommands(String playerName) {
        List<RelayCommand> commands = new ArrayList<>();
        String target = playerName.toLowerCase();
        
        List<?> rawList = queueConfig.getList(target);
        if (rawList != null) {
            for (Object obj : rawList) {
                if (obj instanceof Map) {
                    Map<?, ?> map = (Map<?, ?>) obj;
                    try {
                        int id = map.containsKey("id") ? Integer.parseInt(String.valueOf(map.get("id"))) : -1;
                        String cmd = map.containsKey("command") ? String.valueOf(map.get("command")) : "";
                        
                        if (id != -1 && !cmd.isEmpty()) {
                            commands.add(new RelayCommand(id, playerName, cmd, true));
                        }
                    } catch (Exception ex) {
                        plugin.getLogger().warning("Failed to parse queued command for " + playerName + ": " + ex.getMessage());
                    }
                }
            }
        }

        return commands;
    }

    public synchronized void clearQueue(String playerName) {
        queueConfig.set(playerName.toLowerCase(), null);
        saveQueue();
    }

    private void saveQueue() {
        try {
            queueConfig.save(queueFile);
        } catch (IOException e) {
            plugin.getLogger().severe("Could not save to queue.yml!");
        }
    }
}
