import React, { useEffect, useState } from 'react';
import { UserRole, Vehicle, MaintenanceAlert, ServiceAppointment, UEBALog } from '../types';
import { autoMind } from '../services/autoMindService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertTriangle, CheckCircle, Activity, Thermometer, Disc, Zap, ShieldCheck, Wrench, FileText, Brain } from 'lucide-react';

// --- COMPONENTS ---

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
            <Icon size={64} />
        </div>
        <div className="relative z-10">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
            <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-white">{value}</span>
                {sub && <span className="text-sm text-slate-500">{sub}</span>}
            </div>
        </div>
    </div>
);

const VehicleDetailCard: React.FC<{ vehicle: Vehicle, onSimulate: () => void | Promise<void>, log: string | null }> = ({ vehicle, onSimulate, log }) => (
    <div className={`bg-slate-900 border ${vehicle.status === 'CRITICAL' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-slate-800'} rounded-xl p-6 transition-all`}>
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-xl font-bold text-white">{vehicle.model}</h2>
                <p className="text-sm text-slate-400 font-mono mt-1">{vehicle.vin}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                vehicle.status === 'HEALTHY' ? 'bg-green-500/20 text-green-400' : 
                vehicle.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
                {vehicle.status}
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Activity size={14} /> <span className="text-xs">RPM</span>
                </div>
                <div className="text-lg font-mono">{vehicle.telematics.rpm}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Thermometer size={14} /> <span className="text-xs">Temp</span>
                </div>
                <div className={`text-lg font-mono ${vehicle.telematics.engineTemp > 100 ? 'text-red-400' : ''}`}>
                    {vehicle.telematics.engineTemp.toFixed(1)}°C
                </div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Disc size={14} /> <span className="text-xs">Brake</span>
                </div>
                <div className={`text-lg font-mono ${vehicle.telematics.brakeWearLevel > 80 ? 'text-red-400' : ''}`}>
                    {vehicle.telematics.brakeWearLevel.toFixed(1)}%
                </div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Zap size={14} /> <span className="text-xs">Battery</span>
                </div>
                <div className="text-lg font-mono">{vehicle.telematics.batteryVoltage.toFixed(1)}V</div>
            </div>
        </div>

        {log && (
            <div className="mb-4 p-3 bg-black/50 rounded border border-slate-800 text-xs font-mono text-green-400">
                <span className="text-blue-400 font-bold">MASTER_AGENT &gt;</span> {log}
            </div>
        )}

        <button 
            onClick={onSimulate}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
            <Activity size={18} />
            <span>Run Predictive Cycle (Gemini)</span>
        </button>
    </div>
);

// --- DASHBOARD VIEWS ---

const OwnerDashboard = ({ vehicles, alerts, onSimulate, logs }: any) => (
    <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Vehicle Health" value={`${vehicles[0]?.healthScore || 100}%`} icon={Activity} color="text-green-500" />
            <StatCard title="Active Alerts" value={alerts.length} icon={AlertTriangle} color="text-red-500" />
            <StatCard title="Next Service" value="Oct 24" icon={CheckCircle} color="text-blue-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-white">My Vehicles</h2>
                {vehicles.map((v: Vehicle) => (
                    <VehicleDetailCard key={v.id} vehicle={v} onSimulate={() => onSimulate(v.id)} log={logs[v.id]} />
                ))}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
                <h3 className="text-lg font-bold text-white mb-4">Predictive Alerts</h3>
                <div className="space-y-4">
                    {alerts.length === 0 && <p className="text-slate-500 text-sm">No active alerts.</p>}
                    {alerts.map((alert: MaintenanceAlert) => (
                        <div key={alert.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 border-l-4 border-l-red-500">
                            <h4 className="text-sm font-bold text-white">{alert.alertType}</h4>
                            <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                            <div className="mt-2 text-xs font-mono text-blue-400">Confidence: {(alert.confidence * 100).toFixed(0)}%</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const FleetDashboard = ({ vehicles }: { vehicles: Vehicle[] }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Fleet" value={vehicles.length} icon={Wrench} color="text-blue-500" />
            <StatCard title="At Risk" value={vehicles.filter(v => v.status !== 'HEALTHY').length} icon={AlertTriangle} color="text-red-500" />
            <StatCard title="Avg Health" value="82%" icon={Activity} color="text-green-500" />
            <StatCard title="Active Jobs" value="3" icon={CheckCircle} color="text-purple-500" />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Fleet Health Heatmap</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicles.map(v => (
                    <div key={v.id} className={`p-4 rounded-lg border ${v.status === 'CRITICAL' ? 'bg-red-900/20 border-red-500' : 'bg-slate-950 border-slate-800'}`}>
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-white">{v.model}</span>
                            <span className={`text-[10px] px-1 rounded ${v.status === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>{v.status}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-400">{v.vin}</div>
                        <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${v.healthScore}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const TechnicianDashboard = () => {
    const [jobs, setJobs] = useState<ServiceAppointment[]>([]);

    useEffect(() => {
        autoMind.getAppointments(UserRole.TECHNICIAN).then(setJobs);
    }, []);

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Assigned Jobs" value={jobs.length} icon={Wrench} color="text-blue-500" />
                <StatCard title="Pending Review" value="1" icon={FileText} color="text-yellow-500" />
                <StatCard title="Completed Today" value="4" icon={CheckCircle} color="text-green-500" />
            </div>
            
            <h2 className="text-xl font-bold text-white">Incoming Service Requests</h2>
            <div className="space-y-4">
                {jobs.map(job => (
                    <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-bold text-white">{job.vehicleModel}</h3>
                                <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/30">AI Predicted</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">Issue: {job.predictedIssue}</p>
                            <p className="text-xs text-slate-500 mt-1">Scheduled: {new Date(job.scheduledTime).toLocaleDateString()}</p>
                        </div>
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium">
                            Start Diagnosis
                        </button>
                    </div>
                ))}
                {jobs.length === 0 && <p className="text-slate-500">No active jobs.</p>}
            </div>
        </div>
    );
}

const AdminDashboard = () => {
    const [logs, setLogs] = useState<UEBALog[]>([]);

    useEffect(() => {
        autoMind.getUEBALogs().then(setLogs);
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">UEBA & System Trust Monitor</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 col-span-2">
                    <h3 className="text-lg font-bold text-white mb-4">Agent Behavior Live Log</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {logs.map(log => (
                            <div key={log.id} className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-2 h-2 rounded-full ${log.status === 'NORMAL' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <div>
                                        <div className="text-sm font-bold text-white">{log.agentName}</div>
                                        <div className="text-xs text-slate-500">{log.action}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-blue-400">Trust: {log.trustScore}%</div>
                                    <div className="text-[10px] text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                     <h3 className="text-lg font-bold text-white mb-4">Agent Trust Scores</h3>
                     <div className="space-y-4">
                        {['Diagnosis Agent', 'Digital Twin', 'Scheduling Agent', 'OEM Insights'].map(agent => (
                            <div key={agent}>
                                <div className="flex justify-between text-sm text-slate-300 mb-1">
                                    <span>{agent}</span>
                                    <span className="text-green-400">98%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full" style={{ width: '98%' }}></div>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN WRAPPER ---

const Dashboard = ({ role }: { role: UserRole }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
    const [logs, setLogs] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, [role]);

    const loadData = async () => {
        const v = await autoMind.getVehicles(role);
        const a = await autoMind.getAlerts(role);
        setVehicles(v);
        setAlerts(a);
    };

    const handleRunDiagnostics = async (id: string) => {
        try {
            setLogs(prev => ({ ...prev, [id]: "Initializing Master Agent..." }));
            const result = await autoMind.runPredictiveCycle(id);
            setVehicles(prev => prev.map(v => v.id === id ? result.vehicle : v));
            if (result.alert) setAlerts(prev => [result.alert!, ...prev]);
            setLogs(prev => ({ ...prev, [id]: result.log }));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="animate-fade-in">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Role: <span className="text-blue-400 font-bold uppercase">{role.replace('_', ' ')}</span></p>
                </div>
                <div className="flex space-x-2">
                     <button onClick={loadData} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded">
                        Refresh Data
                    </button>
                </div>
            </header>

            {role === UserRole.OWNER && <OwnerDashboard vehicles={vehicles} alerts={alerts} onSimulate={handleRunDiagnostics} logs={logs} />}
            {role === UserRole.FLEET_MANAGER && <FleetDashboard vehicles={vehicles} />}
            {role === UserRole.TECHNICIAN && <TechnicianDashboard />}
            {role === UserRole.ADMIN && <AdminDashboard />}
            {role === UserRole.OEM_ENGINEER && <div className="text-slate-400">Please visit the OEM Insights Tab.</div>}
        </div>
    );
};

export default Dashboard;