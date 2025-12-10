import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Wrench } from 'lucide-react';
import { ChatMessage, UserRole } from '../types';
import { autoMind } from '../services/autoMindService';

export const ChatWidget = ({ role }: { role: UserRole }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Only show for Owner and Technician
    if (role !== UserRole.OWNER && role !== UserRole.TECHNICIAN) return null;

    useEffect(() => {
        autoMind.subscribeToChat((msg) => {
            setMessages(prev => [...prev, { ...msg, isMe: msg.role === role }]);
            if (!isOpen) {
                setUnreadCount(prev => prev + 1);
            }
        });
    }, [role, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;
        
        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: role === UserRole.OWNER ? 'Rahul' : 'Arjun',
            role: role,
            text: input,
            timestamp: new Date().toISOString()
        };

        autoMind.sendChatMessage(newMsg);
        setInput('');
    };

    return (
        <div className="fixed bottom-6 right-24 z-50">
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up h-96">
                    <div className="bg-blue-600 p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2 text-white">
                            <MessageSquare size={18} />
                            <span className="font-bold">Live Support</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
                        {messages.length === 0 && (
                            <p className="text-center text-slate-500 text-xs mt-4">Start a conversation...</p>
                        )}
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                    msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                }`}>
                                    <div className="text-[10px] opacity-70 mb-1 font-bold">{msg.sender}</div>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                        <button 
                            onClick={handleSend}
                            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 relative"
            >
                <MessageSquare size={24} />
                {unreadCount > 0 && !isOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>
        </div>
    );
};