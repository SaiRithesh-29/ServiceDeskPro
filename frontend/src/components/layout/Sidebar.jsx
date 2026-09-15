import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Ticket, PlusCircle, HardDrive, BookOpen, Users, Building2, ShieldCheck, Settings, BarChart3, Clock, Bell, LogOut, } from 'lucide-react';
import { cn } from '../../utils/cn.js';
export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const menuSections = [
        {
            title: 'Workspace',
            items: [
                {
                    label: 'Dashboard',
                    icon: LayoutDashboard,
                    path: '/',
                    roles: ['admin', 'it_manager', 'technician', 'employee', 'asset_manager'],
                },
                {
                    label: 'Create Ticket',
                    icon: PlusCircle,
                    path: '/tickets/create',
                    roles: ['employee', 'technician', 'it_manager', 'admin', 'asset_manager'],
                    highlight: true,
                },
                {
                    label: 'Service Tickets',
                    icon: Ticket,
                    path: '/tickets',
                    roles: ['employee', 'technician', 'it_manager', 'admin', 'asset_manager'],
                },
                {
                    label: 'IT Assets',
                    icon: HardDrive,
                    path: '/assets',
                    roles: ['asset_manager', 'it_manager', 'admin', 'technician'],
                },
                {
                    label: 'Knowledge Base',
                    icon: BookOpen,
                    path: '/knowledge-base',
                    roles: ['employee', 'technician', 'it_manager', 'admin', 'asset_manager'],
                },
            ],
        },
        {
            title: 'Management & Insights',
            items: [
                {
                    label: 'Reports & Analytics',
                    icon: BarChart3,
                    path: '/reports',
                    roles: ['admin', 'it_manager', 'technician'],
                },
                {
                    label: 'SLA Policies',
                    icon: Clock,
                    path: '/sla',
                    roles: ['admin', 'it_manager'],
                },
                {
                    label: 'Teams & Depts',
                    icon: Building2,
                    path: '/teams',
                    roles: ['admin', 'it_manager'],
                },
                {
                    label: 'User Directory',
                    icon: Users,
                    path: '/users',
                    roles: ['admin', 'it_manager'],
                },
            ],
        },
        {
            title: 'System & Security',
            items: [
                {
                    label: 'Audit Trail',
                    icon: ShieldCheck,
                    path: '/audit-logs',
                    roles: ['admin', 'it_manager'],
                },
                {
                    label: 'Notifications',
                    icon: Bell,
                    path: '/notifications',
                    roles: ['admin', 'it_manager', 'technician', 'employee', 'asset_manager'],
                },
                {
                    label: 'System Settings',
                    icon: Settings,
                    path: '/settings',
                    roles: ['admin'],
                },
            ],
        },
    ];
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    const getRoleDisplay = (role) => {
        switch (role) {
            case 'admin':
                return 'System Administrator';
            case 'it_manager':
                return 'IT Service Manager';
            case 'technician':
                return 'Support Technician';
            case 'asset_manager':
                return 'Asset & Inventory Manager';
            default:
                return 'Corporate Employee';
        }
    };
    return (<aside className="w-64 bg-slate-950 text-slate-200 min-h-screen flex flex-col border-r border-slate-800/80 shrink-0 select-none">
      {/* User Status Bar */}
      <div className="px-5 py-4 border-b border-slate-800/70 bg-slate-900/40">
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (<img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"/>) : (<div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name?.charAt(0)}
            </div>)}
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-bold text-white truncate">{user?.name}</h2>
            <p className="text-[11px] text-indigo-400 font-medium truncate">{getRoleDisplay(user?.role)}</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {menuSections.map((section) => {
            const visibleSectionItems = section.items.filter((item) => item.roles.includes(user?.role || ''));
            if (visibleSectionItems.length === 0)
                return null;
            return (<div key={section.title} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {section.title}
              </div>
              <ul className="space-y-1">
                {visibleSectionItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (<li key={item.path}>
                      <button onClick={() => navigate(item.path)} className={cn('w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group', isActive
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                            : item.highlight
                                ? 'bg-slate-900/80 text-indigo-300 hover:bg-slate-800 hover:text-white border border-indigo-500/20'
                                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100')}>
                        <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200')}/>
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>);
                })}
              </ul>
            </div>);
        })}
      </nav>

      {/* Bottom Logout Area */}
      <div className="p-3 border-t border-slate-800/70 bg-slate-900/20">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
          <LogOut className="w-4 h-4"/>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>);
}
