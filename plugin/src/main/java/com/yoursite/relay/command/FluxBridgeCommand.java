package com.yoursite.relay.command;

import com.yoursite.relay.RelayPlugin;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabExecutor;

import java.util.ArrayList;
import java.util.List;

public class FluxBridgeCommand implements TabExecutor {

    private final RelayPlugin plugin;

    public FluxBridgeCommand(RelayPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0 || args[0].equalsIgnoreCase("info") || args[0].equalsIgnoreCase("help")) {
            if (!sender.hasPermission("fluxbridge.player.info")) {
                sender.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                return true;
            }
            sender.sendMessage(ChatColor.AQUA + "=== FluxBridge Information ===");
            sender.sendMessage(ChatColor.GRAY + "Author: " + ChatColor.WHITE + "eksses");
            sender.sendMessage(ChatColor.GRAY + "Version: " + ChatColor.WHITE + plugin.getDescription().getVersion());
            sender.sendMessage(ChatColor.GRAY + "Mode: " + ChatColor.WHITE + plugin.getMode());
            sender.sendMessage(ChatColor.GRAY + "Server ID: " + ChatColor.WHITE + plugin.getServerId());
            return true;
        }

        if (args[0].equalsIgnoreCase("reload")) {
            if (!sender.hasPermission("fluxbridge.admin.reload")) {
                sender.sendMessage(ChatColor.RED + "You do not have permission to reload FluxBridge.");
                return true;
            }
            
            sender.sendMessage(ChatColor.YELLOW + "Reloading FluxBridge system...");
            plugin.reloadPlugin();
            sender.sendMessage(ChatColor.GREEN + "FluxBridge reloaded successfully! Mode is now: " + plugin.getMode());
            return true;
        }

        if (args[0].equalsIgnoreCase("test")) {
            if (!sender.hasPermission("fluxbridge.admin.test")) {
                sender.sendMessage(ChatColor.RED + "You do not have permission to test the connection.");
                return true;
            }

            sender.sendMessage(ChatColor.YELLOW + "Testing FluxBridge Connection...");
            plugin.getLogger().info("Admin " + sender.getName() + " requested a connection test.");
            
            // Asynchronously dispatch a heartbeat test
            org.bukkit.Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
                plugin.getHttpClient().sendHeartbeat();
                sender.sendMessage(ChatColor.GREEN + "Test packet sent! Check backend logs for the heartbeat response.");
            });
            return true;
        }

        sender.sendMessage(ChatColor.RED + "Unknown argument. Use /" + label + " <info|reload|test>");
        return true;
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        List<String> completions = new ArrayList<>();
        
        if (args.length == 1) {
            if (sender.hasPermission("fluxbridge.player.info")) {
                completions.add("info");
                completions.add("help");
            }
            if (sender.hasPermission("fluxbridge.admin.reload")) {
                completions.add("reload");
            }
            if (sender.hasPermission("fluxbridge.admin.test")) {
                completions.add("test");
            }
        }
        
        return completions;
    }
}
