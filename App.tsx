import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserRole } from './types';
import { LayoutDashboard, Car, Wrench, Activity, Settings, Zap, Users, ShieldCheck, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Service from './pages/Service';
import OEM from './pages/OEM';
import Login from './pages/Login';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ChatWidget } from './components/ChatWidget';

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Sidebar = ({ role, onLogout }: { role: UserRole, onLogout: () => void }) => {
  const location = useLocation();
  const p = location.pathname;

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center space-x-2">
        <Zap className="text-blue-500" fill="currentColor" size={28} />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          AutoMind
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Menu</div>
        <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={p === '/'} />
        
        {(role === UserRole.FLEET_MANAGER || role === UserRole.ADMIN) && (
          <SidebarItem to="/fleet" icon={Car} label="Fleet Management" active={p === '/fleet'} />
        )}
        
        <SidebarItem to="/service" icon={Wrench} label="Service Center" active={p === '/service'} />
        
        {(role === UserRole.OEM_ENGINEER || role === UserRole.ADMIN) && (
          <SidebarItem to="/oem" icon={Activity} label="OEM Insights" active={p === '/oem'} />
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between px-2 mb-4">
             <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    {role.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-medium text-white">User</p>
                    <p className="text-xs text-slate-400">{role}</p>
                </div>
            </div>
            <button onClick={onLogout} className="text-slate-500 hover:text-white" title="Logout">
                <LogOut size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

const ProtectedLayout = ({ role, setRole }: { role: UserRole | null, setRole: (r: UserRole | null) => void }) => {
    if (!role) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pl-64 transition-all duration-300 relative">
            <Sidebar role={role} onLogout={() => setRole(null)} />
            <VoiceAssistant />
            <ChatWidget role={role} />
            
            <main className="p-8 pb-16">
                <Routes>
                    <Route path="/" element={<Dashboard role={role} />} />
                    <Route path="/fleet" element={<Fleet />} />
                    <Route path="/service" element={<Service role={role} />} />
                    <Route path="/oem" element={<OEM />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>

            <footer className="absolute bottom-0 left-64 right-0 bg-slate-900/50 border-t border-slate-800 py-2 px-8 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span>System Status: Online</span>
                </div>
                <div>
                    Synthetic Data Stream Active | Connected to Supabase Edge Network
                </div>
            </footer>
        </div>
    );
};

const App = () => {
  const [role, setRole] = useState<UserRole | null>(null);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={role ? <Navigate to="/" replace /> : <Login onLogin={(r) => setRole(r)} />} 
        />
        <Route 
          path="/*" 
          element={<ProtectedLayout role={role} setRole={setRole} />} 
        />
      </Routes>
    </Router>
  );
};

export default App;