import React, { useState, useEffect } from 'react';
import { Send, Server, User, TerminalSquare, AlertCircle } from 'lucide-react';

export default function CreateCommandPage() {
    const [servers, setServers] = useState([]);
    const [formData, setFormData] = useState({
        server_id: '',
        player_name: '',
        command: '',
        require_online: true
    });

    const [status, setStatus] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:3000/admin/servers')
            .then(res => res.json())
            .then(data => {
                setServers(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, server_id: data[0].server_id }));
                }
            })
            .catch(err => console.error('Failed to fetch servers:', err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Dispatching command...' });

        try {
            const res = await fetch('http://127.0.0.1:3000/admin/commands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (res.ok) {
                setStatus({
                    type: 'success',
                    message: result.realtime_pushed
                        ? 'Command pushed real-time via WebSocket!'
                        : 'Command queued for Polling execution.'
                });
                setFormData(prev => ({ ...prev, command: '' })); // reset command field
            } else {
                setStatus({ type: 'error', message: result.error || 'Failed to dispatch command.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-sans">Dispatch Command</h1>
                <p className="text-slate-400 mt-2">Send realtime or queued commands to connected servers.</p>
            </div>

            {status && (
                <div className={`p-4 mb-6 rounded-lg border flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}>
                    {status.type === 'error' && <AlertCircle size={20} />}
                    <span className="font-medium">{status.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl">
                <div className="space-y-6">

                    {/* Server Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                            <Server size={16} className="text-blue-400" />
                            Target Server
                        </label>
                        <select
                            required
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            value={formData.server_id}
                            onChange={(e) => setFormData({ ...formData, server_id: e.target.value })}
                        >
                            <option value="" disabled>Select a server</option>
                            {servers.map((srv, i) => (
                                <option key={i} value={srv.server_id}>
                                    {srv.name || srv.server_id} ({srv.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Player Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                            <User size={16} className="text-emerald-400" />
                            Target Player (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Samir"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                            value={formData.player_name}
                            onChange={(e) => setFormData({ ...formData, player_name: e.target.value })}
                        />
                        <p className="text-xs text-slate-500 mt-2">Leave blank to execute globally as console.</p>
                    </div>

                    {/* Command */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                            <TerminalSquare size={16} className="text-purple-400" />
                            Command
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-500 font-mono">/</span>
                            <input
                                required
                                type="text"
                                placeholder="give %player% diamond 1"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pl-8 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none font-mono"
                                value={formData.command}
                                onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Require Online Toggle */}
                    <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <input
                            type="checkbox"
                            id="require_online"
                            className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 bg-slate-900"
                            checked={formData.require_online}
                            onChange={(e) => setFormData({ ...formData, require_online: e.target.checked })}
                        />
                        <label htmlFor="require_online" className="text-sm font-medium text-slate-300 cursor-pointer select-none flex-1">
                            Require player to be online
                            <p className="text-xs text-slate-500 font-normal mt-0.5">
                                If checked, the command will be queued until the player joins the server.
                            </p>
                        </label>
                    </div>

                </div>

                <div className="mt-8 pt-6 border-t border-slate-700">
                    <button
                        type="submit"
                        disabled={status?.type === 'loading'}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white p-4 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                    >
                        <Send size={20} />
                        {status?.type === 'loading' ? 'Dispatching...' : 'Dispatch Command Now'}
                    </button>
                </div>
            </form>
        </div>
    );
}
