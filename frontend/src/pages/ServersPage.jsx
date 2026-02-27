import React, { useEffect, useState } from 'react';
import { Server, Activity, Clock, ShieldCheck } from 'lucide-react';

export default function ServersPage() {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/admin/servers')
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

    const createTestServer = async () => {
        await fetch('http://localhost:3000/admin/servers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server_id: 'survival_1', name: 'Survival Realm' })
        });
        window.location.reload();
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
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${srv.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {srv.status || 'OFFLINE'}
                                </span>
                            </div>

                            <div className="space-y-3 mt-6">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Clock size={16} className="text-slate-500" />
                                    <span>Last Heartbeat: {srv.last_heartbeat ? new Date(srv.last_heartbeat).toLocaleString() : 'Never'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-700">
                                    <ShieldCheck size={16} className="text-slate-500" />
                                    <span className="font-mono text-xs truncate" title={srv.api_key}>Key: {srv.api_key}</span>
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
