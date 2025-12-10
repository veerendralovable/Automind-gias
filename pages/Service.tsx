import React, { useState, useEffect } from 'react';
import { UserRole, ServiceAppointment } from '../types';
import { Calendar, MapPin, Clock, Wrench, CheckCircle, FileText, Cpu, AlertTriangle, Timer } from 'lucide-react';
import { autoMind } from '../services/autoMindService';

const RepairModal = ({ job, onClose, onComplete }: any) => {
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async () => {
        setProcessing(true);
        // Simulate repair completion and OEM Agent trigger
        await autoMind.completeRepairJob(job.id, notes);
        setProcessing(false);
        onComplete();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
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
                        <label className="block text-sm text-slate-400 mb-2">Technician Notes (Root Cause & Fix)</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!notes || processing}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {processing ? <span>Processing Agent...</span> : <>
                            <CheckCircle size={18} />
                            <span>Complete Job & Send to OEM</span>
                        </>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Service = ({ role }: { role: UserRole }) => {
    const [scheduled, setScheduled] = useState(false);
    const [jobs, setJobs] = useState<ServiceAppointment[]>([]);
    const [selectedJob, setSelectedJob] = useState<ServiceAppointment | null>(null);

    useEffect(() => {
        if (role === UserRole.TECHNICIAN) {
            autoMind.getAppointments(role).then(setJobs);
        }
    }, [role]);

    const handleAutoSchedule = async () => {
        setScheduled(true);
        await autoMind.scheduleService('v1', 'AutoMind Central Hub');
    };

    if (role === UserRole.TECHNICIAN) {
        return (
            <div className="max-w-6xl mx-auto">
                 <div className="flex justify-between items-center mb-8">
                     <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Technician Job Board</h1>
                        <p className="text-slate-400">Select a job to view AI diagnostics and perform repairs.</p>
                     </div>
                     <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center space-x-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         <span className="text-sm font-bold text-white">Live Queue</span>
                     </div>
                 </div>
                 
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

                 {selectedJob && (
                    <RepairModal 
                        job={selectedJob} 
                        onClose={() => setSelectedJob(null)} 
                        onComplete={() => {
                            setSelectedJob(null);
                            autoMind.getAppointments(role).then(setJobs); // Refresh
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

                    <p className="text-slate-300 mb-8">
                        The Scheduling Agent analyzes fleet location, service center availability, and part inventory to find the optimal slot.
                    </p>

                    {!scheduled ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                                <h3 className="font-bold text-white mb-2">Pending Request: Tesla Model 3</h3>
                                <p className="text-sm text-slate-400">Reason: Predictive Brake Wear Alert (Confidence 92%)</p>
                            </div>
                            <button 
                                onClick={handleAutoSchedule}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg transition-all"
                            >
                                Auto-Schedule Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6 text-center animate-fade-in">
                            <div className="inline-block p-2 bg-green-500 rounded-full mb-3">
                                <Calendar className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-green-400">Appointment Confirmed</h3>
                            <p className="text-slate-300 mt-2">
                                Booked for <strong>Oct 24, 10:30 AM</strong>
                            </p>
                            <div className="flex items-center justify-center space-x-2 mt-2 text-sm text-slate-400">
                                <MapPin size={14} />
                                <span>AutoMind Central Hub, Bay 4</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Map Placeholder */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-hidden h-96 relative">
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                        <p className="text-slate-500 font-medium">Interactive Service Map Loading...</p>
                    </div>
                    {/* Simulated Map Markers */}
                    <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                    <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                </div>
            </div>
        </div>
    );
};

export default Service;