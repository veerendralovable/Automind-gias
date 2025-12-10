import React, { useEffect, useState } from 'react';
import { autoMind } from '../services/autoMindService';
import { UserRole, Vehicle, VehicleStatus, Driver } from '../types';
import { Search, Filter, MoreHorizontal, Calendar, DollarSign, TrendingUp, PieChart as PieIcon, LayoutGrid, ChevronDown, Users, Phone, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BulkScheduleModal = ({ count, onClose }: { count: number, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Bulk Schedule Confirmed</h2>
                <p className="text-slate-400 mb-6">
                    Successfully booked service slots for <strong className="text-white">{count} vehicles</strong>.
                    <br/>
                    Efficiency gain: <span className="text-green-400">42% reduction in downtime</span>.
                </p>
                <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">
                    Return to Fleet
                </button>
            </div>
        </div>
    );
}

const FinancialDashboard = () => {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        autoMind.getFleetFinancials().then(setData);
    }, []);

    if (!data) return <div className="p-8 text-center text-slate-500">Loading financial data...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-green-500">
                        <DollarSign size={64} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase">YTD Savings</h3>
                    <div className="mt-2 text-3xl font-bold text-white">${data.savings.toLocaleString()}</div>
                    <div className="text-green-400 text-xs mt-1">+18% vs Last Year</div>
                </div>
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500">
                        <TrendingUp size={64} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase">Cost Per Mile</h3>
                    <div className="mt-2 text-3xl font-bold text-white">$0.42</div>
                    <div className="text-blue-400 text-xs mt-1">Optimal Range</div>
                </div>
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-purple-500">
                        <PieIcon size={64} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase">Total Maintenance Spend</h3>
                    <div className="mt-2 text-3xl font-bold text-white">${data.totalSpend.toLocaleString()}</div>
                    <div className="text-slate-500 text-xs mt-1">Projected end-of-year: $42k</div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Maintenance Spend vs Savings Analysis</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.monthly}>
                            <defs>
                                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                            <Area type="monotone" dataKey="spend" stroke="#ef4444" fillOpacity={1} fill="url(#colorSpend)" name="Maintenance Cost" />
                            <Area type="monotone" dataKey="savings" stroke="#22c55e" fillOpacity={1} fill="url(#colorSavings)" name="Predictive Savings" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const DriversList = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);

    useEffect(() => {
        autoMind.getDrivers().then(setDrivers);
    }, []);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Personnel Management</h3>
                <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded">
                    Add Driver
                </button>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">License</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Safety Score</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {drivers.map(d => (
                        <tr key={d.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                        {d.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-white">{d.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">{d.licenseNumber}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    d.status === 'ACTIVE' ? 'bg-green-900/50 text-green-400' :
                                    d.status === 'ON_LEAVE' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-slate-700 text-slate-400'
                                }`}>
                                    {d.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                    <Award size={14} className={d.safetyScore > 90 ? "text-yellow-400" : "text-slate-500"} />
                                    <span className={`font-bold ${d.safetyScore > 90 ? "text-white" : "text-slate-400"}`}>{d.safetyScore}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400 flex items-center gap-2">
                                <Phone size={12} /> {d.contact}
                            </td>
                            <td className="px-6 py-4">
                                <button className="text-slate-400 hover:text-white">
                                    <MoreHorizontal size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Fleet = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'drivers'>('overview');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  // Filtering States
  const [statusFilter, setStatusFilter] = useState<'ALL' | VehicleStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = () => {
    autoMind.getVehicles(UserRole.FLEET_MANAGER).then(setVehicles);
  };

  const toggleSelect = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleSelectAllRisk = () => {
      const riskIds = vehicles.filter(v => v.status !== 'HEALTHY').map(v => v.id);
      if (selectedIds.size === riskIds.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(riskIds));
      }
  };

  const handleBulkSchedule = async () => {
      await autoMind.bulkScheduleRepair(Array.from(selectedIds));
      setShowBulkModal(true);
      setTimeout(() => {
         setSelectedIds(new Set());
         loadVehicles();
      }, 1000);
  };

  // Filter Logic
  const filteredVehicles = vehicles.filter(v => {
      const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const matchesSearch = v.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           v.vin.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
  });

  return (
    <div className="relative pb-24">
        {showBulkModal && <BulkScheduleModal count={selectedIds.size} onClose={() => setShowBulkModal(false)} />}

        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Fleet Management</h1>
            <div className="flex space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <LayoutGrid size={16} />
                    <span>Overview</span>
                </button>
                <button 
                    onClick={() => setActiveTab('financials')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'financials' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <DollarSign size={16} />
                    <span>Financials</span>
                </button>
                <button 
                    onClick={() => setActiveTab('drivers')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'drivers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Users size={16} />
                    <span>Drivers</span>
                </button>
            </div>
        </div>

        {activeTab === 'financials' ? (
            <FinancialDashboard />
        ) : activeTab === 'drivers' ? (
            <DriversList />
        ) : (
            <>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search VIN or Model..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
                         <div className="relative group">
                            <button className="flex items-center space-x-2 bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors min-w-[140px] justify-between">
                                <span className="text-sm font-medium">
                                    {statusFilter === 'ALL' ? 'All Statuses' : statusFilter}
                                </span>
                                <ChevronDown size={14} className="text-slate-400"/>
                            </button>
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 hidden group-hover:block">
                                {['ALL', 'HEALTHY', 'WARNING', 'CRITICAL', 'IN_SERVICE'].map((status) => (
                                    <button 
                                        key={status}
                                        onClick={() => setStatusFilter(status as any)}
                                        className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {status === 'ALL' ? 'All Statuses' : status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-12">
                                    <input type="checkbox" className="rounded bg-slate-800 border-slate-700" onChange={toggleSelectAllRisk} />
                                </th>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Health Score</th>
                                <th className="px-6 py-4">Last Sync</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredVehicles.map(v => (
                                <tr key={v.id} className={`hover:bg-slate-800/50 transition-colors ${selectedIds.has(v.id) ? 'bg-blue-900/10' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.has(v.id)}
                                            onChange={() => toggleSelect(v.id)}
                                            className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500" 
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-white">{v.model}</div>
                                            <div className="text-xs text-slate-500">{v.vin}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            v.status === 'HEALTHY' ? 'bg-green-900/50 text-green-400' : 
                                            v.status === 'IN_SERVICE' ? 'bg-blue-900/50 text-blue-400' : 
                                            v.status === 'CRITICAL' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'
                                        }`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${v.healthScore > 80 ? 'bg-green-500' : v.healthScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                    style={{ width: `${v.healthScore}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-slate-300">{v.healthScore}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {new Date(v.telematics.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-slate-400 hover:text-white">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredVehicles.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            No vehicles found matching your criteria.
                        </div>
                    )}
                </div>

                {/* BULK ACTION BAR */}
                {selectedIds.size > 0 && (
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-6 z-40 animate-fade-in-up">
                        <span className="font-bold">{selectedIds.size} Vehicles Selected</span>
                        <div className="h-4 w-px bg-blue-400"></div>
                        <button 
                            onClick={handleBulkSchedule}
                            className="flex items-center space-x-2 font-bold hover:text-blue-200 transition-colors"
                        >
                            <Calendar size={18} />
                            <span>Auto-Schedule Service</span>
                        </button>
                    </div>
                )}
            </>
        )}
    </div>
  );
};

export default Fleet;