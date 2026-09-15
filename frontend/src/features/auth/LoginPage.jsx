import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { Shield, Wrench, User, HardDrive, Briefcase, Sparkles, Zap } from 'lucide-react';
const DEMO_ACCOUNTS = [
    { role: 'System Admin', email: 'admin@servicedesk.pro', password: 'Password123!', icon: Shield, color: 'from-purple-500 to-violet-600', border: 'border-purple-200 hover:border-purple-400', bg: 'bg-purple-50' },
    { role: 'IT Manager', email: 'manager@servicedesk.pro', password: 'Password123!', icon: Briefcase, color: 'from-blue-500 to-indigo-600', border: 'border-blue-200 hover:border-blue-400', bg: 'bg-blue-50' },
    { role: 'Technician', email: 'tech1@servicedesk.pro', password: 'Password123!', icon: Wrench, color: 'from-indigo-500 to-blue-600', border: 'border-indigo-200 hover:border-indigo-400', bg: 'bg-indigo-50' },
    { role: 'Employee', email: 'employee1@servicedesk.pro', password: 'Password123!', icon: User, color: 'from-emerald-500 to-teal-600', border: 'border-emerald-200 hover:border-emerald-400', bg: 'bg-emerald-50' },
    { role: 'Asset Manager', email: 'assetmgr@servicedesk.pro', password: 'Password123!', icon: HardDrive, color: 'from-amber-500 to-orange-600', border: 'border-amber-200 hover:border-amber-400', bg: 'bg-amber-50' },
];
export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        }
        catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDemoLogin = async (demoEmail, demoPassword, role) => {
        setError('');
        setDemoLoading(role);
        try {
            await login(demoEmail, demoPassword);
            navigate('/');
        }
        catch (err) {
            setError(`Demo login failed for ${role}. Run "npm run seed" first.`);
        }
        finally {
            setDemoLoading(null);
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Login Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-4">
              <Sparkles className="w-7 h-7"/>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              ServiceDesk <span className="text-indigo-600">Pro</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Enterprise IT Service Management</p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')}/>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" isLoading={loading}>Sign In</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign up</Link>
            </p>
          </div>
        </div>

        {/* Right — 1-Click Demo Quick Switcher */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 text-white mb-2">
              <Zap className="w-5 h-5 text-amber-400"/>
              <h2 className="text-lg font-bold">Quick Demo Access</h2>
            </div>
            <p className="text-indigo-200/80 text-sm">Click any role below to instantly sign in with demo credentials.</p>
          </div>

          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((demo) => {
            const Icon = demo.icon;
            const isLoading = demoLoading === demo.role;
            return (<button key={demo.role} onClick={() => handleDemoLogin(demo.email, demo.password, demo.role)} disabled={!!demoLoading} className={`w-full flex items-center gap-4 p-4 rounded-xl border ${demo.border} bg-white/5 hover:bg-white/10 transition-all group disabled:opacity-50`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${demo.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                    <Icon className="w-5 h-5"/>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-white text-sm">{demo.role}</p>
                    <p className="text-xs text-indigo-300/70">{demo.email}</p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-300/50 group-hover:text-white transition-colors">
                    {isLoading ? 'Signing in...' : 'Login →'}
                  </span>
                </button>);
        })}
          </div>

          
        </div>
      </div>
    </div>);
}
