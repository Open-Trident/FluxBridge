import React, { useEffect, useState } from 'react';
import { Activity, Terminal, AlertCircle, CheckCircle } from 'lucide-react';

export default function CommandsLogPage() {
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/admin/commands')
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
                                {commands.map((cmd) => (
                                    <tr key={cmd.id || cmd._id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 font-mono text-xs text-slate-500">#{cmd.id || String(cmd._id).slice(-4)}</td>
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
                                        <td className="p-4 max-w-xs truncate text-sm text-slate-400" title={cmd.response_message || '-'}>
                                            {cmd.response_message || (cmd.require_online && cmd.status === 'PENDING' ? 'Waiting for player...' : '-')}
                                        </td>
                                        <td className="p-4 text-right text-sm text-slate-500 whitespace-nowrap">
                                            {new Date(cmd.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
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
