import React, { useState, useEffect, useRef } from 'react';
import { UserRole, ServiceAppointment, InventoryItem, Invoice } from '../types';
import { Calendar, MapPin, Clock, Wrench, CheckCircle, FileText, Cpu, AlertTriangle, Timer, Navigation, Package, RefreshCw, ShoppingCart, Plus, Minus, DollarSign, Download, ArrowRight } from 'lucide-react';
import { autoMind } from '../services/autoMindService';

// Declare Leaflet global
declare const L: any;

const InvoiceModal = ({ invoice, onClose }: { invoice: Invoice, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-50 text-slate-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-slate-800">AutoMind Service Invoice</h2>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-200 uppercase tracking-wide">
                            Generated
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">INV-{invoice.id.split('-')[1]}</p>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                         {invoice.items.map((item, idx) => (
                             <div key={idx} className="flex justify-between text-sm">
                                 <div>
                                     <span className="font-medium text-slate-700">{item.description}</span>
                                     <span className="text-slate-400 text-xs ml-2">x{item.quantity}</span>
                                 </div>
                                 <span className="font-mono">${(item.cost * item.quantity).toLocaleString()}</span>
                             </div>
                         ))}
                    </div>

                    <div className="border-t border-dashed border-slate-300 my-4 pt-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">Parts Subtotal</span>
                            <span>${invoice.totalParts.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">Labor Subtotal</span>
                            <span>${invoice.totalLabor.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-slate-200">
                            <span>Total Due</span>
                            <span className="text-blue-600">${invoice.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-100 flex space-x-3">
                    <button onClick={onClose} className="flex-1 bg-white border border-slate-300 text-slate-600 font-bold py-3 rounded-lg hover:bg-slate-50">
                        Close
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20">
                        <Download size={18} />
                        <span>Download PDF</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const RepairModal = ({ job, onClose, onComplete, inventory }: { job: ServiceAppointment, onClose: () => void, onComplete: () => void, inventory: InventoryItem[] }) => {
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [selectedParts, setSelectedParts] = useState<{id: string, qty: number}[]>([]);
    const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);

    const togglePart = (id: string) => {
        if (selectedParts.find(p => p.id === id)) {
            setSelectedParts(selectedParts.filter(p => p.id !== id));
        } else {
            setSelectedParts([...selectedParts, { id, qty: 1 }]);
        }
    };

    const handleSubmit = async () => {
        setProcessing(true);
        // Simulate repair completion, parts deduction, and OEM Agent trigger
        const invoice = await autoMind.completeRepairJob(job.id, notes, selectedParts);
        setGeneratedInvoice(invoice);
        setProcessing(false);
    };

    const handleInvoiceClose = () => {
        onComplete();
    };

    if (generatedInvoice) {
        return <InvoiceModal invoice={generatedInvoice} onClose={handleInvoiceClose} />;
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-xl font-bold text-white">Service Mode: {job.vehicleModel}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded border border-slate-800">
                            <span className="text-xs text-slate-500 uppercase">Predicted Issue</span>
                            <div className="text-white font-medium">{job.predictedIssue}</div>
                        </div>
                         <div className="bg-slate-950 p-4 rounded border border-slate-800">
                            <span className="text-xs text-slate-500 uppercase">Digital Twin Validation</span>
                            <div className="text-green-400 font-medium">Confirmed (99%)</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Parts Used</label>
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                            {inventory.filter(i => i.status !== 'OUT_OF_STOCK').map(item => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            checked={!!selectedParts.find(p => p.id === item.id)}
                                            onChange={() => togglePart(item.id)}
                                            className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div>
                                            <div className="text-sm text-white">{item.name}</div>
                                            <div className="text-xs text-slate-500">Stock: {item.quantity} | SKU: {item.sku}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        ${item.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Technician Notes (Root Cause & Fix)</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Describe the fault found and actions taken..."
                        ></textarea>
                    </div>

                    <div className="flex items-start space-x-3 bg-blue-900/20 p-4 rounded border border-blue-500/30">
                        <Cpu className="text-blue-400 mt-1" size={20} />
                        <div>
                            <h4 className="text-sm font-bold text-blue-400">OEM Feedback Loop</h4>
                            <p className="text-xs text-slate-300 mt-1">
                                Submitting this report will trigger the OEM Insights Agent to generate a Learning Card and update the global fleet model.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-800 flex justify-end space-x-3 bg-slate-900 sticky bottom-0">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!notes || processing}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {processing ? <span>Processing Agent...</span> : <>
                            <CheckCircle size={18} />
                            <span>Complete Job & Invoice</span>
                        </>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InventoryView = ({ inventory, onRestock }: { inventory: InventoryItem[], onRestock: () => void }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Package className="text-blue-500" />
                    Service Inventory
                </h2>
                <div className="text-xs text-slate-500">Auto-Restock Agent Active</div>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Part Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {inventory.map(item => (
                        <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <div className="font-medium text-white">{item.name}</div>
                                    <div className="text-xs text-slate-500">SKU: {item.sku}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">{item.category}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    item.status === 'IN_STOCK' ? 'bg-green-900/50 text-green-400' : 
                                    item.status === 'LOW_STOCK' ? 'bg-yellow-900/50 text-yellow-400' : 
                                    'bg-red-900/50 text-red-400'
                                }`}>
                                    {item.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${item.quantity > item.threshold ? 'bg-blue-500' : 'bg-red-500'}`} 
                                            style={{ width: `${Math.min(100, (item.quantity / 50) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-slate-300">{item.quantity}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {item.status !== 'IN_STOCK' && (
                                    <button 
                                        onClick={onRestock}
                                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center space-x-1"
                                    >
                                        <RefreshCw size={12} />
                                        <span>Restock</span>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Service = ({ role }: { role: UserRole }) => {
    const [activeTab, setActiveTab] = useState<'jobs' | 'inventory'>('jobs');
    const [scheduled, setScheduled] = useState(false);
    const [jobs, setJobs] = useState<ServiceAppointment[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [selectedJob, setSelectedJob] = useState<ServiceAppointment | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    // Time Slot Selection (Simulated)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const availableSlots = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"];

    useEffect(() => {
        if (role === UserRole.TECHNICIAN) {
            autoMind.getAppointments(role).then(setJobs);
            autoMind.getInventory().then(setInventory);
        }
    }, [role]);

    // Initialize Leaflet Map
    useEffect(() => {
        // Only init if not technician (Technician sees job board, others see schedule map)
        if (role === UserRole.TECHNICIAN) return;
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return; // Prevent double init

        // Coordinates for Hyderabad (Demo Story)
        const vehiclePos = [17.4933, 78.3914]; // KPHB Colony
        const hubPos = [17.4401, 78.3489]; // Gachibowli (Service Hub)

        try {
            const map = L.map(mapContainerRef.current).setView(vehiclePos, 13);
            mapInstanceRef.current = map;

            // Dark Mode Tiles (CartoDB Dark Matter)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // Custom Icons
            const vehicleIcon = L.divIcon({
                className: 'pulse-marker',
                html: '<div class="pulse-dot"></div>',
                iconSize: [20, 20]
            });

            const hubIcon = L.divIcon({
                className: 'hub-marker',
                html: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
                iconSize: [32, 32]
            });

            // Markers
            L.marker(vehiclePos, { icon: vehicleIcon }).addTo(map).bindPopup("Your Vehicle (i20)");
            L.marker(hubPos, { icon: hubIcon }).addTo(map).bindPopup("AutoMind Central Hub");

            // Route Line
            const latlngs = [vehiclePos, hubPos];
            L.polyline(latlngs, { color: '#3b82f6', weight: 3, opacity: 0.7, dashArray: '10, 10' }).addTo(map);

            // Fit Bounds
            map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });

        } catch (e) {
            console.error("Error initializing map", e);
        }
    }, [role]);

    const handleAutoSchedule = async () => {
        if (!selectedSlot) return; // Enforce slot selection
        setScheduled(true);
        await autoMind.scheduleService('v1', 'AutoMind Central Hub');
    };

    const handleRestock = async () => {
        // Trigger restocking of low items
        const lowItems = inventory.filter(i => i.status !== 'IN_STOCK');
        for (const item of lowItems) {
            await autoMind.restockPart(item.id);
        }
        autoMind.getInventory().then(setInventory);
    };

    if (role === UserRole.TECHNICIAN) {
        return (
            <div className="max-w-6xl mx-auto">
                 <div className="flex justify-between items-center mb-8">
                     <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Technician Dashboard</h1>
                        <p className="text-slate-400">Bay 2 Active | AutoMind Assisted Diagnosis</p>
                     </div>
                     
                     <div className="flex space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('jobs')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'jobs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Job Board
                        </button>
                        <button 
                            onClick={() => setActiveTab('inventory')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Parts Inventory
                        </button>
                     </div>
                 </div>
                 
                 {activeTab === 'jobs' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.length === 0 && (
                            <div className="col-span-3 text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                                <Wrench className="mx-auto text-slate-600 mb-4" size={48} />
                                <p className="text-slate-500 font-medium">No active jobs assigned.</p>
                                <p className="text-xs text-slate-600 mt-2">New automated bookings will appear here instantly.</p>
                            </div>
                        )}
                        {jobs.map(job => (
                            <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 transition-all group relative overflow-hidden">
                                {/* Severity Stripe */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

                                <div className="flex justify-between items-start mb-4 pl-2">
                                    <span className="bg-blue-600/20 text-blue-400 text-[10px] uppercase font-bold px-2 py-1 rounded border border-blue-500/30">
                                        IN BAY 2
                                    </span>
                                    {job.status === 'CONFIRMED' && (
                                        <span className="flex items-center space-x-1 text-red-400 text-xs font-bold animate-pulse">
                                            <Timer size={12} /> <span>SLA: 4h</span>
                                        </span>
                                    )}
                                </div>
                                
                                <div className="pl-2">
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{job.vehicleModel}</h3>
                                    <p className="text-sm text-slate-300 font-medium mb-1">{job.predictedIssue}</p>
                                    <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                                        <Clock size={12} /> Scheduled: {new Date(job.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                
                                    <button 
                                        onClick={() => setSelectedJob(job)}
                                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center space-x-2 border border-slate-700 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all"
                                    >
                                        <Wrench size={16} />
                                        <span>Start Service</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                     </div>
                 ) : (
                     <InventoryView inventory={inventory} onRestock={handleRestock} />
                 )}

                 {selectedJob && (
                    <RepairModal 
                        job={selectedJob} 
                        inventory={inventory}
                        onClose={() => setSelectedJob(null)} 
                        onComplete={() => {
                            setSelectedJob(null);
                            // Refresh both
                            autoMind.getAppointments(role).then(setJobs); 
                            autoMind.getInventory().then(setInventory);
                        }} 
                    />
                 )}
            </div>
        );
    }

    // Default View (Owner/Fleet)
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Service Scheduling Agent</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Agent Action Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-blue-600 rounded-full">
                            <Clock className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Autonomous Scheduler</h2>
                            <p className="text-sm text-slate-400">AI Optimization Active</p>
                        </div>
                    </div>

                    <p className="text-slate-300 mb-6">
                        The Scheduling Agent analyzes fleet location, service center availability, and part inventory to find the optimal slot.
                    </p>

                    {!scheduled ? (
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                <h3 className="font-bold text-white mb-2">Pending Request: Tesla Model 3</h3>
                                <p className="text-sm text-slate-400">Reason: Predictive Brake Wear Alert (Confidence 92%)</p>
                            </div>
                            
                            {/* Time Slot Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Available Time Slot</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableSlots.map(slot => (
                                        <button 
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                                                selectedSlot === slot 
                                                ? 'bg-blue-600 border-blue-500 text-white' 
                                                : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                                            }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleAutoSchedule}
                                disabled={!selectedSlot}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {selectedSlot ? `Confirm Booking for ${selectedSlot}` : 'Select a Time Slot'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6 text-center animate-fade-in">
                            <div className="inline-block p-2 bg-green-500 rounded-full mb-3">
                                <Calendar className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-green-400">Appointment Confirmed</h3>
                            <p className="text-slate-300 mt-2">
                                Booked for <strong>Oct 24, {selectedSlot}</strong>
                            </p>
                            <div className="flex items-center justify-center space-x-2 mt-2 text-sm text-slate-400">
                                <MapPin size={14} />
                                <span>AutoMind Central Hub, Bay 4</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Interactive Map */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-hidden h-[460px] relative">
                    <div ref={mapContainerRef} className="w-full h-full rounded-lg z-0" />
                    
                    {/* Overlay Info */}
                    <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-lg text-xs shadow-lg">
                        <div className="flex items-center space-x-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-white">Vehicle</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full border border-red-500"></div>
                            <span className="text-white">Service Hub</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Service;