import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { Zap, User, Truck, Wrench, Activity, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginProps {
    onLogin: (role: UserRole) => void;
}

const PersonaCard = ({ role, name, icon: Icon, color, onClick }: any) => (
    <button 
        onClick={onClick}
        className="flex items-center p-4 bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xl transition-all group w-full hover:bg-slate-750"
    >
        <div className={`p-3 rounded-full ${color} bg-opacity-20 text-white mr-4 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div className="text-left flex-1">
            <h3 className="font-bold text-white text-lg">{name}</h3>
            <p className="text-xs text-slate-400 uppercase tracking-wider">{role.replace('_', ' ')}</p>
        </div>
        <ArrowRight className="text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
    </button>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const navigate = useNavigate();

    const handleLogin = (role: UserRole) => {
        onLogin(role);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
                
                <div className="flex flex-col justify-center">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Zap className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                            AutoMind
                        </h1>
                    </div>
                    
                    <h2 className="text-4xl font-bold text-white mb-4">Autonomous Predictive Maintenance</h2>
                    <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                        Experience the future of mobility. 
                        A fully agentic ecosystem where vehicles predict failures, 
                        schedule their own repairs, and teach engineers how to build better cars.
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-slate-500 font-mono">
                        <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div> System Online</span>
                        <span>v2.4.0-RC</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">Select Persona Demo</div>
                    
                    <PersonaCard 
                        role={UserRole.OWNER} 
                        name="Rahul" 
                        icon={User} 
                        color="bg-blue-500" 
                        onClick={() => handleLogin(UserRole.OWNER)} 
                    />
                    <PersonaCard 
                        role={UserRole.FLEET_MANAGER} 
                        name="Kavya" 
                        icon={Truck} 
                        color="bg-purple-500" 
                        onClick={() => handleLogin(UserRole.FLEET_MANAGER)} 
                    />
                    <PersonaCard 
                        role={UserRole.TECHNICIAN} 
                        name="Arjun" 
                        icon={Wrench} 
                        color="bg-orange-500" 
                        onClick={() => handleLogin(UserRole.TECHNICIAN)} 
                    />
                    <PersonaCard 
                        role={UserRole.OEM_ENGINEER} 
                        name="Priya" 
                        icon={Activity} 
                        color="bg-pink-500" 
                        onClick={() => handleLogin(UserRole.OEM_ENGINEER)} 
                    />
                    <PersonaCard 
                        role={UserRole.ADMIN} 
                        name="Manoj" 
                        icon={ShieldCheck} 
                        color="bg-green-500" 
                        onClick={() => handleLogin(UserRole.ADMIN)} 
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;