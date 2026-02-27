package com.yoursite.relay.listener;

import com.yoursite.relay.RelayPlugin;
import com.yoursite.relay.model.RelayCommand;
import com.yoursite.relay.queue.QueueManager;
import org.bukkit.Bukkit;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;

import java.util.List;

public class PlayerJoinListener implements Listener {

    private final RelayPlugin plugin;
    private final QueueManager queueManager;

    public PlayerJoinListener(RelayPlugin plugin, QueueManager queueManager) {
        this.plugin = plugin;
        this.queueManager = queueManager;
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        String playerName = event.getPlayer().getName();
        List<RelayCommand> commands = queueManager.getQueuedCommands(playerName);

        if (!commands.isEmpty()) {
            plugin.getLogger().info("Executing " + commands.size() + " queued commands for " + playerName);

            Bukkit.getScheduler().runTaskLater(plugin, () -> {
                for (RelayCommand cmd : commands) {
                    boolean success = Bukkit.dispatchCommand(Bukkit.getConsoleSender(), cmd.getCommand());

                    // Send result back to API
                    sendResult(cmd.getCommandId(), success ? "SUCCESS" : "FAILED", 
                        success ? "Executed from queue upon player join" : "Failed to execute from queue");
                }
                
                // Clear the player's queue after execution
                queueManager.clearQueue(playerName);
            }, 20L); // Execute 1 second after join
        }
    }

    private void sendResult(int commandId, String status, String message) {
        // We will call the API to update the result here
        // This will be implemented either via HttpClient or WebSocketClient
        // For now, delegate back to the plugin or a shared ResultDispatcher
        plugin.sendResult(commandId, status, message);
    }
}
