import React, { useEffect, useState } from 'react';
import { autoMind } from '../services/autoMindService';
import { UserRole, Vehicle } from '../types';
import { Search, Filter, MoreHorizontal, CheckSquare, Calendar, CheckCircle } from 'lucide-react';

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

const Fleet = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filterRisk, setFilterRisk] = useState(false);

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
      // Connect to backend logic
      await autoMind.bulkScheduleRepair(Array.from(selectedIds));
      
      setShowBulkModal(true);
      
      // Refresh list after delay to show updated status
      setTimeout(() => {
         setSelectedIds(new Set());
         loadVehicles();
      }, 1000);
  };

  const filteredVehicles = filterRisk ? vehicles.filter(v => v.status !== 'HEALTHY') : vehicles;

  return (
    <div className="relative pb-24">
        {showBulkModal && <BulkScheduleModal count={selectedIds.size} onClose={() => setShowBulkModal(false)} />}

        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Fleet Management</h1>
            <div className="flex space-x-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search VIN or Model..." 
                        className="bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button 
                    onClick={() => setFilterRisk(!filterRisk)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${filterRisk ? 'bg-red-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                >
                    <Filter size={18} />
                    <span>{filterRisk ? 'Showing At-Risk' : 'Filter Risk'}</span>
                </button>
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
    </div>
  );
};

export default Fleet;