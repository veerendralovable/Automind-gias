import React, { useState } from 'react';
import { UserRole } from '../types';
import { User, Bell, Lock, Shield, Eye, BellOff, Moon, Globe, LogOut } from 'lucide-react';

const Settings = () => {
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [smsAlerts, setSmsAlerts] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Settings & Preferences</h1>
            <p className="text-slate-400 mb-8">Manage your profile, notifications, and security settings.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                            R
                        </div>
                        <h2 className="text-xl font-bold text-white">Rahul Sharma</h2>
                        <p className="text-sm text-slate-400 mb-4">Vehicle Owner</p>
                        
                        <div className="flex justify-center space-x-2 mb-6">
                            <span className="px-3 py-1 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-500/30">Verified</span>
                            <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full border border-blue-500/30">Premium</span>
                        </div>

                        <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                            Edit Profile
                        </button>
                    </div>

                     <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Storage Usage</h3>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                            <div className="bg-blue-500 h-full w-[45%]"></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>4.5 GB Used</span>
                            <span>10 GB Total</span>
                        </div>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Notifications */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Bell className="text-blue-500" />
                            <h3 className="text-lg font-bold text-white">Notifications</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                <div>
                                    <div className="text-sm font-bold text-white">Email Alerts</div>
                                    <div className="text-xs text-slate-500">Receive weekly health reports</div>
                                </div>
                                <button 
                                    onClick={() => setEmailAlerts(!emailAlerts)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${emailAlerts ? 'bg-blue-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailAlerts ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                <div>
                                    <div className="text-sm font-bold text-white">SMS & Push</div>
                                    <div className="text-xs text-slate-500">Instant predictive alerts</div>
                                </div>
                                <button 
                                    onClick={() => setSmsAlerts(!smsAlerts)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${smsAlerts ? 'bg-blue-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${smsAlerts ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Eye className="text-purple-500" />
                            <h3 className="text-lg font-bold text-white">Appearance & Region</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                <div className="flex items-center space-x-3">
                                    <Moon size={18} className="text-slate-400"/>
                                    <div className="text-sm font-bold text-white">Dark Mode</div>
                                </div>
                                <div className="text-xs text-slate-500 font-mono">ALWAYS ON</div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                <div className="flex items-center space-x-3">
                                    <Globe size={18} className="text-slate-400"/>
                                    <div className="text-sm font-bold text-white">Language</div>
                                </div>
                                <select className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 focus:outline-none">
                                    <option>English (US)</option>
                                    <option>Hindi</option>
                                    <option>Spanish</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Shield className="text-green-500" />
                            <h3 className="text-lg font-bold text-white">Privacy & Security</h3>
                        </div>

                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-300">Data Sharing (OEM Analytics)</div>
                                <span className="text-xs text-green-400 font-bold">ENABLED</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-300">Two-Factor Authentication</div>
                                <button className="text-xs text-blue-400 hover:text-white underline">Setup</button>
                            </div>
                            <div className="pt-4 border-t border-slate-800 mt-4">
                                <button className="flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm font-bold">
                                    <LogOut size={16} />
                                    <span>Sign out of all devices</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Settings;