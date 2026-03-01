import React, { useEffect, useState } from 'react';
import { Server, Activity, Clock, ShieldCheck, Copy, CheckCircle2, Trash2 } from 'lucide-react';

export default function ServersPage() {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedKey, setCopiedKey] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:3000/admin/servers')
            .then(res => res.json())
            .then(data => {
                setServers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch servers:', err);
                setLoading(false);
            });
    }, []);

    const copyToClipboard = (key) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const createTestServer = async () => {
        await fetch('http://127.0.0.1:3000/admin/servers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server_id: 'survival_1', name: 'Survival Realm' })
        });
        window.location.reload();
    };

    const deleteServer = async (serverId) => {
        if (!window.confirm(`Are you sure you want to delete server "${serverId}"? This will permanently wipe all logs and cannot be undone.`)) {
            return;
        }

        try {
            await fetch(`http://127.0.0.1:3000/admin/servers/${serverId}`, {
                method: 'DELETE'
            });
            setServers(s => s.filter(x => x.server_id !== serverId));
        } catch (err) {
            console.error('Failed to delete server:', err);
            alert('Encountered an error while trying to delete server.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-sans">Network Servers</h1>
                    <p className="text-slate-400 mt-2">Manage and monitor connected Minecraft servers.</p>
                </div>
                <button onClick={createTestServer} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    + Add Test Server
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Activity className="animate-spin text-blue-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servers.map((srv, i) => (
                        <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-lg ${srv.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        <Server size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{srv.server_id}</h3>
                                        <p className="text-sm text-slate-400">{srv.name || 'Unnamed'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${srv.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {srv.status || 'OFFLINE'}
                                    </span>
                                    <button
                                        onClick={() => deleteServer(srv.server_id)}
                                        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all group-hover:opacity-100 opacity-0 transform translate-x-2 group-hover:translate-x-0"
                                        title="Delete Server"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mt-6">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Clock size={16} className="text-slate-500" />
                                    <span>Last Heartbeat: {srv.last_heartbeat ? new Date(srv.last_heartbeat).toLocaleString() : 'Never'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-700 mt-2">
                                    <ShieldCheck size={16} className="text-slate-500 shrink-0" />
                                    <span className="font-mono text-xs opacity-50 blur-[2px] hover:blur-none hover:opacity-100 transition-all cursor-crosshair flex-1 pr-2 truncate">
                                        {srv.api_key}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(srv.api_key)}
                                        className="shrink-0 text-slate-400 hover:text-white transition-colors"
                                        title="Copy API Key"
                                    >
                                        {copiedKey === srv.api_key ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {servers.length === 0 && (
                        <div className="col-span-full border-2 border-dashed border-slate-700 rounded-xl p-12 text-center text-slate-400">
                            No servers connected yet. Create one to get started!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
