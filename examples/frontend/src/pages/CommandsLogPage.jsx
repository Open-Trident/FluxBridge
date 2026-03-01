import React, { useEffect, useState } from 'react';
import { Activity, Terminal, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function CommandsLogPage() {
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState(new Set());

    useEffect(() => {
        fetch('http://127.0.0.1:3000/admin/commands')
            .then(res => res.json())
            .then(data => {
                setCommands(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch commands:', err);
                setLoading(false);
            });
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle className="text-emerald-500" size={18} />;
            case 'FAILED': return <AlertCircle className="text-red-500" size={18} />;
            case 'PENDING':
            case 'SENT':
            case 'QUEUED': return <Activity className="text-blue-500 animate-pulse" size={18} />;
            default: return <Terminal className="text-slate-500" size={18} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'FAILED': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'PENDING': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            case 'SENT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'QUEUED': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-slate-800 text-slate-300 border-slate-700';
        }
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-sans">Command Logs</h1>
                <p className="text-slate-400 mt-2">Track real-time command execution history across servers.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Activity className="animate-spin text-purple-500" size={32} />
                </div>
            ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 border-b border-slate-700 text-sm font-semibold text-slate-300">
                                    <th className="p-4 w-16">ID</th>
                                    <th className="p-4">Target Server</th>
                                    <th className="p-4">Player</th>
                                    <th className="p-4">Command</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Message</th>
                                    <th className="p-4 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {commands.map((cmd) => {
                                    const cId = cmd.id || cmd._id;
                                    const isExpanded = expandedRows.has(cId);

                                    return (
                                        <React.Fragment key={cId}>
                                            <tr
                                                onClick={() => toggleRow(cId)}
                                                className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
                                            >
                                                <td className="p-4 font-mono text-xs text-slate-500 flex items-center gap-2">
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    #{cId || String(cId).slice(-4)}
                                                </td>
                                                <td className="p-4 font-medium text-slate-200">{cmd.server_id}</td>
                                                <td className="p-4">
                                                    {cmd.player_name ? (
                                                        <span className="bg-slate-900 px-2 py-1 rounded text-sm text-blue-300 border border-slate-700">
                                                            {cmd.player_name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500 text-sm italic">Console</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <code className="bg-black/30 text-emerald-300 px-2 py-1 rounded text-sm">
                                                        /{cmd.command}
                                                    </code>
                                                </td>
                                                <td className="p-4">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(cmd.status)}`}>
                                                        {getStatusIcon(cmd.status)}
                                                        {cmd.status}
                                                    </div>
                                                </td>
                                                <td className="p-4 max-w-xs truncate text-sm text-slate-400 group-hover:text-slate-300 transition-colors" title={cmd.response_message || '-'}>
                                                    {cmd.response_message || (cmd.require_online && cmd.status === 'PENDING' ? 'Waiting for player...' : '-')}
                                                </td>
                                                <td className="p-4 text-right text-sm text-slate-500 whitespace-nowrap">
                                                    {new Date(cmd.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-slate-900/30 border-b-0">
                                                    <td colSpan="7" className="p-0">
                                                        <div className="p-6 border-l-4 border-blue-500 bg-slate-800/50 flex flex-col gap-4 shadow-inner">
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Raw Request Payload</h4>
                                                                <pre className="bg-black/50 p-3 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-700/50">
                                                                    {JSON.stringify({
                                                                        command_id: cId,
                                                                        server_id: cmd.server_id,
                                                                        raw_command: cmd.command,
                                                                        target: cmd.player_name || 'CONSOLE',
                                                                        require_online: cmd.require_online,
                                                                        timestamp: cmd.created_at
                                                                    }, null, 2)}
                                                                </pre>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Debug Response / Trace</h4>
                                                                <pre className={`p-3 rounded-lg font-mono text-xs overflow-x-auto border ${cmd.status === 'FAILED' ? 'bg-red-950/20 border-red-900/50 text-red-400' :
                                                                        cmd.status === 'SUCCESS' ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' :
                                                                            'bg-slate-900/50 border-slate-700/50 text-slate-300'
                                                                    }`}>
                                                                    {cmd.response_message || 'Awaiting response from Minecraft Client...'}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                {commands.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-12 text-center text-slate-500 border-t border-slate-700">
                                            No commands executed yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
