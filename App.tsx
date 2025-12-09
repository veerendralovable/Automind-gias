import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { UserRole } from './types';
import { LayoutDashboard, Car, Wrench, Activity, Settings, Zap, Users, ShieldCheck } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Service from './pages/Service';
import OEM from './pages/OEM';
import { VoiceAssistant } from './components/VoiceAssistant';

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Sidebar = ({ role }: { role: UserRole }) => {
  const location = useLocation();
  const p = location.pathname;

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0">
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
        <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                {role.charAt(0)}
            </div>
            <div>
                <p className="text-sm font-medium text-white">Demo User</p>
                <p className="text-xs text-slate-400">{role}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const RoleSwitcher = ({ currentRole, setRole }: { currentRole: UserRole, setRole: (r: UserRole) => void }) => (
    <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-slate-700 p-2 rounded-lg shadow-xl flex items-center space-x-2">
        <span className="text-xs text-slate-400 uppercase font-bold">View As:</span>
        <select 
            value={currentRole} 
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="bg-slate-900 text-white text-sm border-none rounded focus:ring-1 focus:ring-blue-500 py-1 px-2"
        >
            {Object.values(UserRole).map(r => (
                <option key={r} value={r}>{r}</option>
            ))}
        </select>
    </div>
);

const AppContent = () => {
  const [role, setRole] = useState<UserRole>(UserRole.OWNER);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pl-64 transition-all duration-300">
      <Sidebar role={role} />
      <RoleSwitcher currentRole={role} setRole={setRole} />
      <VoiceAssistant />
      
      <main className="p-8">
        <Routes>
          <Route path="/" element={<Dashboard role={role} />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/service" element={<Service role={role} />} />
          <Route path="/oem" element={<OEM />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;