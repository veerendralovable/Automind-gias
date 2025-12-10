import React, { useEffect, useState } from 'react';
import { autoMind } from '../services/autoMindService';
import { LearningCard, ClusterAnalysis } from '../types';
import { Brain, FileText, Share2, Layers, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const OEM = () => {
    const [cards, setCards] = useState<LearningCard[]>([]);
    const [clusters, setClusters] = useState<ClusterAnalysis[]>([]);

    useEffect(() => {
        // Poll for updates to show the "Live" effect of technician submission
        const interval = setInterval(() => {
            autoMind.getLearningCards().then(setCards);
            autoMind.getClusterStats().then(setClusters);
        }, 2000);
        autoMind.getLearningCards().then(setCards);
        autoMind.getClusterStats().then(setClusters);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pb-12">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">OEM Insights & Learning Cards</h1>
                    <p className="text-slate-400 mt-1">
                        Aggregated feedback loop from service centers.
                    </p>
                </div>
                <div className="flex items-center space-x-2 text-purple-400 bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-500/30">
                    <Layers size={18} />
                    <span className="font-bold text-sm">Cluster Analysis Active</span>
                </div>
            </header>

            {/* CLUSTER ANALYSIS CHART */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BarChartIcon className="text-purple-500" />
                        Defect Trend Analysis (By Fault Type)
                    </h2>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={clusters} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <XAxis type="number" stroke="#64748b" />
                            <YAxis dataKey="vehicleModel" type="category" width={120} stroke="#94a3b8" fontSize={12} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                cursor={{fill: '#1e293b'}}
                            />
                            <Bar dataKey="count" name="Reported Cases" radius={[0, 4, 4, 0]}>
                                {clusters.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.severity === 'CRITICAL' ? '#ef4444' : entry.severity === 'HIGH' ? '#f59e0b' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(card => (
                    <div key={card.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500 transition-colors group animate-fade-in relative overflow-hidden">
                        {/* Occurrence Badge */}
                        <div className="absolute top-0 right-0 bg-slate-800 px-3 py-1 rounded-bl-xl text-xs font-bold text-slate-300">
                            {card.occurrenceCount} Occurrences
                        </div>

                        <div className="flex items-start justify-between mb-4 mt-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <Brain size={24} />
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-1">{card.faultType}</h3>
                        <p className="text-sm text-blue-400 mb-4">{card.vehicleModel}</p>
                        
                        <div className="space-y-3 mb-6 bg-slate-950 p-4 rounded-lg border border-slate-800">
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Identified Root Cause</span>
                                <p className="text-sm text-slate-300 mt-1 leading-relaxed">{card.rootCause}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-800 mt-2">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Recommended Fix</span>
                                <p className="text-sm text-slate-300 mt-1 leading-relaxed">{card.fixSummary}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>Generated: {new Date(card.generatedAt || Date.now()).toLocaleDateString()}</span>
                            <button className="text-slate-400 hover:text-white flex items-center space-x-1">
                                <Share2 size={14} /> <span>Export to PLM</span>
                            </button>
                        </div>
                    </div>
                ))}
                
                {/* Empty State / Add New Placeholder */}
                <div className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-slate-500 hover:border-slate-600 hover:text-slate-400 transition-colors">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p className="font-medium text-center">Waiting for new insights...</p>
                    <p className="text-xs text-center mt-2 max-w-xs">New cards appear here automatically when technicians submit confirmed repair reports.</p>
                </div>
            </div>
        </div>
    );
};

export default OEM;