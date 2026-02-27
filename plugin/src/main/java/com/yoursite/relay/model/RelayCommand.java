package com.yoursite.relay.model;

public class RelayCommand {
    private final int commandId;
    private final String playerName;
    private final String command;
    private final boolean requireOnline;

    public RelayCommand(int commandId, String playerName, String command, boolean requireOnline) {
        this.commandId = commandId;
        this.playerName = playerName;
        this.command = command;
        this.requireOnline = requireOnline;
    }

    public int getCommandId() { return commandId; }
    public String getPlayerName() { return playerName; }
    public String getCommand() { return command; }
    public boolean isRequireOnline() { return requireOnline; }
    
    @Override
    public String toString() {
        return "RelayCommand{" +
                "id=" + commandId +
                ", player='" + playerName + '\'' +
                ", cmd='" + command + '\'' +
                ", requireOnline=" + requireOnline +
                '}';
    }
}
