import React, { useEffect, useState, useRef } from 'react';
import { UserRole, Vehicle, MaintenanceAlert, ServiceAppointment, UEBALog } from '../types';
import { autoMind } from '../services/autoMindService';
import { AlertTriangle, CheckCircle, Activity, Thermometer, Disc, Zap, Wrench, FileText, Brain, ArrowRight, X, Cpu, Server, ShieldCheck, Siren, BarChart2, Target, Eye, Database, History, RefreshCcw, Plus, Wifi } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- COMPONENTS ---

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className={`absolute top-0 right-0 p-4 opacity-10 ${color} group-hover:scale-110 transition-transform`}>
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

const AddVehicleModal = ({ onClose }: { onClose: () => void }) => {
    const [step, setStep] = useState(1);

    const handleNext = () => {
        if (step < 2) setStep(step + 1);
        else onClose(); // In a real app, submit data here
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Register New Vehicle</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="p-6">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">VIN (Vehicle Identification Number)</label>
                                <input type="text" placeholder="Enter 17-character VIN" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Make</label>
                                    <input type="text" placeholder="e.g. Hyundai" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Model</label>
                                    <input type="text" placeholder="e.g. i20" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Year</label>
                                <input type="number" placeholder="2024" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 text-center">
                             <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wifi size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Connect Data Stream</h3>
                            <p className="text-sm text-slate-400">Select how AutoMind connects to your vehicle telemetry.</p>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <button className="p-4 bg-slate-950 border border-slate-700 rounded-xl hover:border-blue-500 transition-colors text-left group">
                                    <div className="font-bold text-white group-hover:text-blue-400">OBD-II Dongle</div>
                                    <div className="text-xs text-slate-500 mt-1">Direct Bluetooth Connect</div>
                                </button>
                                <button className="p-4 bg-slate-950 border border-slate-700 rounded-xl hover:border-blue-500 transition-colors text-left group">
                                    <div className="font-bold text-white group-hover:text-blue-400">OEM Cloud API</div>
                                    <div className="text-xs text-slate-500 mt-1">Over-the-air Sync</div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                    <button onClick={handleNext} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors">
                        {step === 1 ? 'Next Step' : 'Complete Setup'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const LiveTelemetry = ({ active }: { active: boolean }) => {
    const [data, setData] = useState<{ time: string, temp: number, rpm: number }[]>([]);

    useEffect(() => {
        if (!active) return;
        // Seed initial data
        const initialData = Array.from({ length: 20 }).map((_, i) => ({
            time: i.toString(),
            temp: 85 + Math.random() * 5,
            rpm: 2000 + Math.random() * 500
        }));
        setData(initialData);

        const interval = setInterval(() => {
            setData(prev => {
                const last = prev[prev.length - 1];
                const newPoint = {
                    time: new Date().toLocaleTimeString([], { second: '2-digit' }),
                    // Simulate drift upwards for the story
                    temp: Math.min(105, 88 + (Math.random() * 8)), 
                    rpm: 2000 + (Math.random() * 800)
                };
                return [...prev.slice(1), newPoint];
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [active]);

    return (
        <div className="h-48 w-full mt-4 bg-slate-950/50 rounded-lg border border-slate-800 p-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" hide />
                    <YAxis yAxisId="left" domain={[60, 120]} hide />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 4000]} hide />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} animationDuration={300} name="Engine Temp (°C)" />
                    <Line yAxisId="right" type="monotone" dataKey="rpm" stroke="#3b82f6" strokeWidth={2} dot={false} animationDuration={300} name="RPM" />
                </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between px-4 text-[10px] text-slate-500 font-mono mt-1">
                <span className="flex items-center"><div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div> Engine Temp (Live)</span>
                <span className="flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div> RPM (Live)</span>
            </div>
        </div>
    );
};

// --- DIGITAL TWIN SIMULATION MODAL ---
const DigitalTwinModal = ({ vehicle, onClose, onComplete }: any) => {
    const [step, setStep] = useState(0); // 0: Init, 1: AI Scan, 2: Twin Sim, 3: Result
    const [checkItems, setCheckItems] = useState([
        { label: "Thermal Correlation (RPM vs Temp)", status: "pending" },
        { label: "Electrical Load Analysis", status: "pending" },
        { label: "Mechanical Drift & Wear Rate", status: "pending" }
    ]);
    
    useEffect(() => {
        const sequence = async () => {
            await new Promise(r => setTimeout(r, 1000));
            setStep(1); // Gemini Analysis
            
            await new Promise(r => setTimeout(r, 2000));
            setStep(2); // Digital Twin Physics
            
            // Animate checklist
            await new Promise(r => setTimeout(r, 500));
            setCheckItems(prev => prev.map((item, i) => i === 0 ? { ...item, status: "success" } : item));
            await new Promise(r => setTimeout(r, 800));
            setCheckItems(prev => prev.map((item, i) => i === 1 ? { ...item, status: "success" } : item));
            await new Promise(r => setTimeout(r, 800));
            setCheckItems(prev => prev.map((item, i) => i === 2 ? { ...item, status: "success" } : item));
            
            await new Promise(r => setTimeout(r, 1000));
            setStep(3); // Result
            await new Promise(r => setTimeout(r, 1000));
            onComplete();
        };
        sequence();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-white mb-6">AutoMind Predictive Diagnostics</h2>
                    
                    <div className="space-y-6">
                        {/* Step 1: Telemetry Ingestion */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-500 ${step >= 0 ? 'bg-slate-800 border-blue-500/50' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
                            <div className="flex items-center space-x-3">
                                <Activity className={step >= 0 ? "text-blue-400 animate-pulse" : "text-slate-600"} />
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white">Live Telemetry Ingestion</div>
                                    <div className="text-xs text-slate-400">Streaming Sensor Data...</div>
                                </div>
                            </div>
                            {step > 0 && <CheckCircle className="text-green-500" size={20} />}
                        </div>

                        {/* Step 2: Gemini Analysis */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-500 ${step >= 1 ? 'bg-slate-800 border-purple-500/50' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
                            <div className="flex items-center space-x-3">
                                <Brain className={step >= 1 ? "text-purple-400 animate-pulse" : "text-slate-600"} />
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white">Diagnosis Agent (Gemini)</div>
                                    <div className="text-xs text-slate-400">Identifying Anomalies...</div>
                                </div>
                            </div>
                            {step > 1 && <CheckCircle className="text-green-500" size={20} />}
                        </div>

                        {/* Step 3: Digital Twin */}
                        <div className={`p-4 rounded-xl border transition-all duration-500 ${step >= 2 ? 'bg-slate-800 border-cyan-500/50' : 'bg-slate-950 border-slate-800 opacity-50'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <Cpu className={step >= 2 ? "text-cyan-400 animate-spin-slow" : "text-slate-600"} />
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-white">Digital Twin Simulation</div>
                                        <div className="text-xs text-slate-400">Physics Validation Layer</div>
                                    </div>
                                </div>
                                {step > 2 && <CheckCircle className="text-green-500" size={20} />}
                            </div>
                            {step >= 2 && (
                                <div className="space-y-2 pl-9">
                                    {checkItems.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <span className="text-slate-300">{item.label}</span>
                                            {item.status === 'success' ? 
                                                <span className="text-green-400 font-mono">PASSED</span> : 
                                                <span className="text-slate-600 font-mono">...</span>
                                            }
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {step === 3 && (
                        <div className="mt-8 animate-fade-in-up">
                            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl">
                                <div className="flex items-center justify-center space-x-2 text-red-400 mb-2">
                                    <AlertTriangle />
                                    <span className="font-bold">VALIDATED ALERT</span>
                                </div>
                                <p className="text-white font-bold text-lg">Brake Pad Wear Critical</p>
                                <p className="text-slate-400 text-sm">Confidence: 99.8% | Est. Failure: 130km</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const VehicleDetailCard: React.FC<{ vehicle: Vehicle, onSimulate: () => void, log: string | null, history?: ServiceAppointment[] }> = ({ vehicle, onSimulate, log, history = [] }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

    return (
    <div className={`bg-slate-900 border ${vehicle.status === 'CRITICAL' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : vehicle.status === 'WARNING' ? 'border-yellow-500/50' : 'border-slate-800'} rounded-xl p-6 transition-all`}>
        <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">{vehicle.model} <span className="text-sm font-normal text-slate-400">({vehicle.year})</span></h2>
            <div className="flex space-x-2 bg-slate-800 rounded p-1">
                <button onClick={() => setActiveTab('overview')} className={`px-3 py-1 rounded text-xs font-bold ${activeTab === 'overview' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Overview</button>
                <button onClick={() => setActiveTab('history')} className={`px-3 py-1 rounded text-xs font-bold ${activeTab === 'history' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>History</button>
            </div>
        </div>

        {activeTab === 'overview' ? (
            <>
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="w-full md:w-1/3">
                        <img src={vehicle.imageUrl} alt={vehicle.model} className="w-full h-48 object-cover rounded-lg border border-slate-800" />
                        <LiveTelemetry active={true} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-slate-400 font-mono">VIN: {vehicle.vin}</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${
                                vehicle.status === 'HEALTHY' ? 'bg-green-500/20 text-green-400' : 
                                vehicle.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                                {vehicle.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase">Engine Temp</div>
                                    <div className={`text-lg font-mono ${vehicle.telematics.engineTemp > 95 ? 'text-red-400' : 'text-white'}`}>{vehicle.telematics.engineTemp.toFixed(1)}°C</div>
                                </div>
                                <Thermometer size={18} className="text-slate-600"/>
                            </div>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase">Brake Wear</div>
                                    <div className={`text-lg font-mono ${vehicle.telematics.brakeWearLevel > 80 ? 'text-red-400' : 'text-white'}`}>{vehicle.telematics.brakeWearLevel.toFixed(1)}%</div>
                                </div>
                                <Disc size={18} className="text-slate-600"/>
                            </div>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase">Battery</div>
                                    <div className="text-lg font-mono text-white">{vehicle.telematics.batteryVoltage.toFixed(1)}V</div>
                                </div>
                                <Zap size={18} className="text-slate-600"/>
                            </div>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase">RPM</div>
                                    <div className="text-lg font-mono text-white">{vehicle.telematics.rpm}</div>
                                </div>
                                <Activity size={18} className="text-slate-600"/>
                            </div>
                        </div>
                    </div>
                </div>

                {log && (
                    <div className="mb-4 p-3 bg-black/50 rounded border border-slate-800 text-xs font-mono text-green-400 animate-fade-in">
                        <span className="text-blue-400 font-bold">MASTER_AGENT &gt;</span> {log}
                    </div>
                )}

                <div className="flex space-x-4">
                    <button 
                        onClick={onSimulate}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20"
                    >
                        <Activity size={18} />
                        <span>Run AI Predictive Diagnostics</span>
                    </button>
                    {vehicle.status !== 'HEALTHY' && (
                        <Link to="/service" className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center space-x-2">
                            <CheckCircle size={18} />
                            <span>Auto-Schedule Repair</span>
                        </Link>
                    )}
                </div>
            </>
        ) : (
            <div className="h-64 overflow-y-auto">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <History size={32} className="mb-2 opacity-50" />
                        <p>No service history found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map(apt => (
                            <div key={apt.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-lg">
                                <div>
                                    <div className="font-bold text-white text-sm">{apt.predictedIssue}</div>
                                    <div className="text-xs text-slate-500">{new Date(apt.scheduledTime).toLocaleDateString()} • {apt.serviceCenter}</div>
                                </div>
                                <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded border border-green-500/30">COMPLETED</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
    </div>
    );
};

// --- DASHBOARD VIEWS ---

const OwnerDashboard = ({ vehicles, alerts, onSimulate, logs, history }: any) => {
    const [showSimulation, setShowSimulation] = useState(false);
    const [simulatingId, setSimulatingId] = useState<string | null>(null);
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    const [alertFilter, setAlertFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

    const handleSimulateClick = (id: string) => {
        setSimulatingId(id);
        setShowSimulation(true);
    };

    const handleSimulationComplete = () => {
        if (simulatingId) {
            onSimulate(simulatingId);
        }
        setShowSimulation(false);
        setSimulatingId(null);
    };

    const filteredAlerts = alertFilter === 'ALL' 
        ? alerts 
        : alerts.filter((a: MaintenanceAlert) => a.severity === alertFilter);

    return (
    <div className="space-y-6 relative">
         {showSimulation && (
            <DigitalTwinModal 
                vehicle={vehicles.find((v: any) => v.id === simulatingId)} 
                onClose={() => setShowSimulation(false)}
                onComplete={handleSimulationComplete}
            />
         )}
         {showAddVehicle && (
             <AddVehicleModal onClose={() => setShowAddVehicle(false)} />
         )}

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Health Score" value={`${vehicles[0]?.healthScore || 100}%`} icon={Activity} color="text-green-500" />
            <StatCard title="Active Alerts" value={alerts.length} icon={AlertTriangle} color="text-red-500" />
            <StatCard title="Est. Service Due" value="3 Days" icon={CheckCircle} color="text-blue-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">My Vehicle</h2>
                    <button 
                        onClick={() => setShowAddVehicle(true)}
                        className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus size={16} />
                        <span>Add Vehicle</span>
                    </button>
                </div>
                {vehicles.map((v: Vehicle) => (
                    <VehicleDetailCard key={v.id} vehicle={v} onSimulate={() => handleSimulateClick(v.id)} log={logs[v.id]} history={history} />
                ))}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Live Alerts</h3>
                    <div className="flex space-x-1">
                        <button 
                            onClick={() => setAlertFilter('ALL')}
                            className={`px-2 py-1 text-[10px] font-bold rounded ${alertFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                        >ALL</button>
                        <button 
                            onClick={() => setAlertFilter('CRITICAL')}
                            className={`px-2 py-1 text-[10px] font-bold rounded ${alertFilter === 'CRITICAL' ? 'bg-red-900/50 text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                        >CRIT</button>
                        <button 
                            onClick={() => setAlertFilter('HIGH')}
                            className={`px-2 py-1 text-[10px] font-bold rounded ${alertFilter === 'HIGH' ? 'bg-yellow-900/50 text-yellow-400' : 'text-slate-500 hover:text-yellow-400'}`}
                        >HIGH</button>
                    </div>
                </div>
                <div className="space-y-4">
                    {filteredAlerts.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No active alerts found.</p>
                        </div>
                    )}
                    {filteredAlerts.map((alert: MaintenanceAlert) => (
                        <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                            alert.severity === 'CRITICAL' ? 'bg-red-900/10 border-red-500' : 
                            alert.severity === 'HIGH' ? 'bg-yellow-900/10 border-yellow-500' : 'bg-slate-950 border-blue-500'
                        }`}>
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-white">{alert.alertType}</h4>
                                <span className="text-[10px] uppercase font-bold text-slate-400">{alert.severity}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                            <div className="mt-2 flex justify-between items-center text-xs font-mono">
                                <span className="text-blue-400">Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                                <span className="text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
    );
};

const FleetDashboard = ({ vehicles }: { vehicles: Vehicle[] }) => {
    const atRisk = vehicles.filter(v => v.status !== 'HEALTHY');
    const healthyCount = vehicles.filter(v => v.status === 'HEALTHY').length;

    return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Fleet" value={vehicles.length} icon={Wrench} color="text-blue-500" />
            <StatCard title="Vehicles At Risk" value={atRisk.length} icon={AlertTriangle} color="text-red-500" />
            <StatCard title="Fleet Efficiency" value="94%" icon={Activity} color="text-green-500" />
            <StatCard title="Est. Savings" value="$12.4k" icon={CheckCircle} color="text-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Fleet Health Overview</h3>
                    <Link to="/fleet" className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                        <span>Detailed View</span> <ArrowRight size={14} />
                    </Link>
                </div>
                {/* Visual Representation of Fleet */}
                <div className="grid grid-cols-10 gap-1.5">
                    {vehicles.slice(0, 100).map((v) => (
                         <div 
                            key={v.id} 
                            title={`${v.model} - ${v.status}`}
                            className={`h-6 w-full rounded-sm ${
                                v.status === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 
                                v.status === 'WARNING' ? 'bg-yellow-500' : 'bg-slate-700 hover:bg-green-500'
                            } transition-colors cursor-pointer`}
                        />
                    ))}
                </div>
                <div className="mt-4 flex justify-between text-xs text-slate-500">
                    <span>Showing 100/140 Vehicles</span>
                    <div className="flex space-x-4">
                        <span className="flex items-center"><div className="w-2 h-2 bg-slate-700 rounded mr-1"></div> Healthy</span>
                        <span className="flex items-center"><div className="w-2 h-2 bg-yellow-500 rounded mr-1"></div> Warning</span>
                        <span className="flex items-center"><div className="w-2 h-2 bg-red-500 rounded mr-1"></div> Critical</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Priority Actions</h3>
                <div className="space-y-3">
                    {atRisk.slice(0, 5).map(v => (
                        <div key={v.id} className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800 hover:border-red-500/50 transition-colors">
                            <div>
                                <div className="text-sm font-bold text-white">{v.model}</div>
                                <div className="text-xs text-slate-500">{v.vin}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-red-400">{v.telematics.engineTemp > 100 ? 'Overheating' : 'Brake Wear'}</div>
                                <Link to="/service" className="text-[10px] text-blue-400 hover:underline">Schedule</Link>
                            </div>
                        </div>
                    ))}
                    {atRisk.length > 5 && (
                        <div className="text-center text-xs text-slate-500 pt-2">
                            + {atRisk.length - 5} more vehicles requiring attention
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

const TechnicianDashboard = () => {
    const [jobs, setJobs] = useState<ServiceAppointment[]>([]);

    useEffect(() => {
        autoMind.getAppointments(UserRole.TECHNICIAN).then(setJobs);
    }, []);

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Assigned Jobs" value={jobs.length} icon={Wrench} color="text-blue-500" />
                <StatCard title="Avg Repair Time" value="45m" icon={Activity} color="text-yellow-500" />
                <StatCard title="Accuracy Score" value="99.8%" icon={CheckCircle} color="text-green-500" />
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
                            <p className="text-xs text-slate-500 mt-1">Scheduled: {new Date(job.scheduledTime).toLocaleDateString()} at {new Date(job.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <Link to="/service" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">
                            Start Diagnosis
                        </Link>
                    </div>
                ))}
                {jobs.length === 0 && <p className="text-slate-500">No active jobs.</p>}
            </div>
        </div>
    );
}

const AdminDashboard = () => {
    const [logs, setLogs] = useState<UEBALog[]>([]);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [seedMessage, setSeedMessage] = useState<string | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            autoMind.getUEBALogs().then(setLogs);
            autoMind.getAgentTrustScores().then(setScores);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSimulateAttack = () => {
        autoMind.simulateAgentAttack();
    };

    const handleSeedDatabase = async () => {
        setSeedMessage("Seeding database... please wait.");
        const result = await autoMind.seedDatabase();
        setSeedMessage(result);
        setTimeout(() => setSeedMessage(null), 5000);
    };

    const handleResetDemo = async () => {
        setSeedMessage("Resetting demo environment...");
        const result = await autoMind.resetDatabase();
        setSeedMessage(result);
        setTimeout(() => setSeedMessage(null), 3000);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">UEBA & System Trust Monitor</h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time monitoring of AI Agent behaviors and trust integrity.</p>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={handleSeedDatabase}
                        className="flex items-center space-x-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-3 py-2 rounded-lg transition-colors text-xs"
                    >
                        <Database size={16} />
                        <span>Seed Data</span>
                    </button>
                    <button 
                        onClick={handleResetDemo}
                        className="flex items-center space-x-2 bg-yellow-900/30 border border-yellow-500/50 hover:bg-yellow-900/50 text-yellow-400 px-3 py-2 rounded-lg transition-colors text-xs"
                    >
                        <RefreshCcw size={16} />
                        <span>Reset Demo</span>
                    </button>
                    <button 
                        onClick={handleSimulateAttack}
                        className="flex items-center space-x-2 bg-red-900/30 border border-red-500/50 hover:bg-red-900/50 text-red-400 px-3 py-2 rounded-lg transition-colors text-xs"
                    >
                        <Siren size={16} />
                        <span>Simulate Attack</span>
                    </button>
                </div>
            </header>

            {seedMessage && (
                <div className="bg-blue-900/20 border border-blue-500/50 text-blue-300 p-4 rounded-lg mb-4 animate-fade-in">
                    {seedMessage}
                </div>
            )}
            
            {/* NEW: Quantified Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
                <StatCard title="Model Precision" value="94.2%" icon={Target} color="text-green-500" />
                <StatCard title="Recall" value="89.5%" icon={Eye} color="text-blue-500" />
                <StatCard title="False Positives" value="1.8%" icon={AlertTriangle} color="text-purple-500" />
                <StatCard title="Optimize Rate" value="+42%" icon={BarChart2} color="text-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 col-span-2">
                    <h3 className="text-lg font-bold text-white mb-4">Agent Behavior Live Log</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {logs.map(log => (
                            <div key={log.id} className={`flex items-center justify-between p-3 rounded border transition-colors ${log.status === 'ANOMALY' ? 'bg-red-900/10 border-red-500/50' : 'bg-slate-950 border-slate-800'}`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-2 h-2 rounded-full ${log.status === 'NORMAL' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                                    <div>
                                        <div className="text-sm font-bold text-white">{log.agentName}</div>
                                        <div className="text-xs text-slate-500">{log.action}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-mono ${log.status === 'ANOMALY' ? 'text-red-400 font-bold' : 'text-blue-400'}`}>Trust: {log.trustScore}%</div>
                                    <div className="text-[10px] text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                         <div className="flex items-center justify-between mb-4">
                             <h3 className="text-lg font-bold text-white">Agent Trust Scores</h3>
                             <div className="group relative">
                                <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-xs text-slate-400 cursor-help">?</div>
                                <div className="absolute right-0 w-64 p-3 bg-slate-950 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-300 hidden group-hover:block z-50">
                                    <strong>Trust Formula:</strong>
                                    <br/>
                                    Score = 100 
                                    <br/>
                                    - (Latency &gt; 3s ? 15 : 0) 
                                    <br/>
                                    - (Error Rate * 10)
                                    <br/>
                                    - (Frequency Spike ? 20 : 0)
                                </div>
                             </div>
                         </div>
                         <div className="space-y-4">
                            {['Diagnosis Agent', 'Digital Twin Agent', 'Scheduling Agent', 'OEM Insights Agent'].map(agent => {
                                const score = scores[agent] || 100;
                                const isCritical = score < 80;
                                return (
                                    <div key={agent}>
                                        <div className="flex justify-between text-sm text-slate-300 mb-1">
                                            <span className={isCritical ? 'text-red-400 font-bold' : ''}>{agent}</span>
                                            <span className={isCritical ? "text-red-400" : "text-green-400"}>{score}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-green-500'}`} 
                                                style={{ width: `${score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <ShieldCheck className="text-blue-500" />
                            <h3 className="font-bold text-white">System Status</h3>
                        </div>
                        <p className="text-sm text-slate-400">
                            UEBA Protocol is active. Anomalous agent behavior will trigger automated isolation protocols.
                        </p>
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
    const [history, setHistory] = useState<ServiceAppointment[]>([]);
    const [logs, setLogs] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, [role]);

    const loadData = async () => {
        const v = await autoMind.getVehicles(role);
        const a = await autoMind.getAlerts(role);
        setVehicles(v);
        setAlerts(a);
        if (role === UserRole.OWNER) {
            // In a real app we'd filter by vehicle ID, here we assume owner has one main car for history
            const allApts = await autoMind.getAppointments(role);
            setHistory(allApts.filter(apt => apt.status === 'COMPLETED'));
        }
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

            {role === UserRole.OWNER && <OwnerDashboard vehicles={vehicles} alerts={alerts} onSimulate={handleRunDiagnostics} logs={logs} history={history} />}
            {role === UserRole.FLEET_MANAGER && <FleetDashboard vehicles={vehicles} />}
            {role === UserRole.TECHNICIAN && <TechnicianDashboard />}
            {role === UserRole.ADMIN && <AdminDashboard />}
            {role === UserRole.OEM_ENGINEER && <div className="text-slate-400">Please visit the OEM Insights Tab.</div>}
        </div>
    );
};

export default Dashboard;