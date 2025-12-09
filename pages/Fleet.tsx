import React, { useEffect, useState } from 'react';
import { autoMind } from '../services/autoMindService';
import { UserRole, Vehicle } from '../types';
import { Search, Filter, MoreHorizontal } from 'lucide-react';

const Fleet = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    autoMind.getVehicles(UserRole.FLEET_MANAGER).then(setVehicles);
  }, []);

  return (
    <div>
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
                <button className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center space-x-2">
                    <Filter size={18} />
                    <span>Filter</span>
                </button>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Vehicle</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Health Score</th>
                        <th className="px-6 py-4">Last Sync</th>
                        <th className="px-6 py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {vehicles.map(v => (
                        <tr key={v.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <div className="font-medium text-white">{v.model}</div>
                                    <div className="text-xs text-slate-500">{v.vin}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    v.status === 'HEALTHY' ? 'bg-green-900/50 text-green-400' : 
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
    </div>
  );
};

export default Fleet;