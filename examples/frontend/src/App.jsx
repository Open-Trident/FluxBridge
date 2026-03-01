import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Server, TerminalSquare, PlusCircle } from 'lucide-react';
import ServersPage from './pages/ServersPage';
import CommandsLogPage from './pages/CommandsLogPage';
import CreateCommandPage from './pages/CreateCommandPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-slate-800 p-6 flex flex-col gap-4 border-r border-slate-700">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-8">
            FluxBridge
          </div>

          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
            <Server size={20} className="text-blue-400" />
            <span className="font-medium">Servers</span>
          </Link>

          <Link to="/commands" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
            <TerminalSquare size={20} className="text-purple-400" />
            <span className="font-medium">Logs</span>
          </Link>

          <Link to="/commands/create" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
            <PlusCircle size={20} className="text-emerald-400" />
            <span className="font-medium">Create Command</span>
          </Link>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ServersPage />} />
            <Route path="/commands" element={<CommandsLogPage />} />
            <Route path="/commands/create" element={<CreateCommandPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
