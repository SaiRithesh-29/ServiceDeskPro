import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { Shield, Wrench, User, HardDrive, Briefcase, Sparkles, Zap, Activity } from 'lucide-react';

const DEMO_ACCOUNTS = [
    { role: 'System Admin', email: 'admin@servicedesk.pro', password: 'Password123!', icon: Shield, color: 'text-neon-purple', border: 'border-neon-purple/20 hover:border-neon-purple/40', bg: 'bg-neon-purple/10' },
    { role: 'IT Manager', email: 'manager@servicedesk.pro', password: 'Password123!', icon: Briefcase, color: 'text-neon-blue', border: 'border-neon-blue/20 hover:border-neon-blue/40', bg: 'bg-neon-blue/10' },
    { role: 'Technician', email: 'tech1@servicedesk.pro', password: 'Password123!', icon: Wrench, color: 'text-neon-green', border: 'border-neon-green/20 hover:border-neon-green/40', bg: 'bg-neon-green/10' },
    { role: 'Employee', email: 'employee1@servicedesk.pro', password: 'Password123!', icon: User, color: 'text-cyan-glow', border: 'border-cyan-glow/20 hover:border-cyan-glow/40', bg: 'bg-cyan-glow/10' },
    { role: 'Asset Manager', email: 'assetmgr@servicedesk.pro', password: 'Password123!', icon: HardDrive, color: 'text-neon-amber', border: 'border-neon-amber/20 hover:border-neon-amber/40', bg: 'bg-neon-amber/10' },
];

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(null);
    const showDemoPanel = false;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (demoEmail, demoPassword, role) => {
        setError('');
        setDemoLoading(role);
        try {
            await login(demoEmail, demoPassword);
            navigate('/');
        } catch (err) {
            setError(`Demo login failed for ${role}. Run "npm run seed" first.`);
        } finally {
            setDemoLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-ops-900 bg-ops-grid flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-ops-radial pointer-events-none" />
            
            <div className="w-full max-w-5xl grid grid-cols-1 gap-8 relative z-10">
                {/* Left — Login Form */}
                <div className="glass-panel rounded-2xl p-8 border border-white/[0.08] shadow-panel relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-cyan-glow/10 blur-[100px] pointer-events-none" />
                    
                    <div className="text-center mb-8 relative z-10">
                        <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-cyan-glow/20 to-neon-blue/10 border border-cyan-glow/30 flex items-center justify-center shadow-glow-cyan-sm mb-4">
                            <Activity className="w-7 h-7 text-cyan-glow" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            ServiceDesk <span className="text-cyan-glow">Pro</span>
                        </h1>
                        <p className="text-ops-400 font-mono text-[10px] tracking-[0.2em] mt-2">OPS CONTROL CENTER</p>
                    </div>

                    <div className="relative z-10">
                        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <Input
                                label="System ID / Email"
                                type="email"
                                placeholder="operator@servicedesk.pro"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Input
                                label="Passcode"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="text-right">
                                <Link to="/forgot-password" className="text-xs text-ops-400 hover:text-cyan-glow transition-colors">Emergency Reset?</Link>
                            </div>
                            <Button type="submit" className="w-full mt-2" disabled={loading}>
                                {loading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}
                            </Button>
                        </form>

                        <div className="mt-8 text-center border-t border-white/[0.06] pt-6">
                            <p className="text-ops-400 text-sm">
                                Unauthorized access prohibited.{' '}
                                <Link to="/register" className="text-cyan-glow hover:text-white transition-colors">Request Access</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {showDemoPanel && (
                <div className="glass-card rounded-2xl p-8 border border-white/[0.08] shadow-panel">
                    <div className="text-center mb-6 border-b border-white/[0.06] pb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-neon-amber animate-pulse-slow" />
                            <h2 className="text-sm font-bold text-white tracking-wider uppercase">Simulation Profiles</h2>
                        </div>
                        <p className="text-ops-400 text-xs">Execute immediate override with pre-configured roles.</p>
                    </div>

                    <div className="space-y-3">
                        {DEMO_ACCOUNTS.map((demo) => {
                            const Icon = demo.icon;
                            const isLoading = demoLoading === demo.role;
                            
                            return (
                                <button
                                    key={demo.role}
                                    onClick={() => handleDemoLogin(demo.email, demo.password, demo.role)}
                                    disabled={!!demoLoading}
                                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl border ${demo.border} bg-white/[0.02] hover:bg-white/[0.05] transition-all group disabled:opacity-50`}
                                >
                                    <div className={`w-10 h-10 rounded-lg ${demo.bg} border border-current/20 flex items-center justify-center ${demo.color} shrink-0`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-white/90 text-sm">{demo.role}</p>
                                        <p className="text-xs text-ops-400 font-mono mt-0.5">{demo.email}</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-ops-500 group-hover:text-cyan-glow transition-colors opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 duration-200">
                                        {isLoading ? 'INITIATING...' : 'EXECUTE →'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}
