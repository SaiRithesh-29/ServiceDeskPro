import { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, Settings, Bell, Search, Moon, Sun, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GlobalSearchModal } from '../global/GlobalSearchModal';
export function Topbar() {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navigate = useNavigate();
    // Global Ctrl+K / Cmd+K listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'it_manager':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'technician':
                return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'asset_manager':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            default:
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }
    };
    return (<>
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
        {/* Logo/Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-black text-lg">
            S
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent leading-none">
              ServiceDesk <span className="text-indigo-600 font-black">Pro</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">ENTERPRISE ITSM</div>
          </div>
        </div>

        {/* Global Search Trigger Bar */}
        <div className="flex-1 mx-8 max-w-xl">
          <button onClick={() => setIsSearchOpen(true)} className="w-full flex items-center justify-between pl-3.5 pr-3 py-2 bg-slate-100/80 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200/80 rounded-xl transition-all group">
            <div className="flex items-center gap-2.5 text-sm">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors"/>
              <span>Search tickets, assets, articles, people...</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-500 bg-white rounded-md border border-slate-200 shadow-xs">
                Ctrl + K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right side - Quick Actions & User Menu */}
        <div className="flex items-center gap-3">
          {/* AI Badge indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600"/>
            <span>AI Copilot Active</span>
          </div>

          {/* Notifications */}
          <button onClick={() => navigate('/notifications')} aria-label="Open notifications" className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell className="w-5 h-5"/>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Theme Toggle */}
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors" title="Toggle theme">
            {darkMode ? <Sun className="w-5 h-5 text-amber-500"/> : <Moon className="w-5 h-5"/>}
          </button>

          {/* User Profile Menu */}
          <div className="relative ml-2">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
              {user?.avatarUrl ? (<img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"/>) : (<div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>)}
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                  {user?.name}
                </div>
                <div className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.2 rounded border inline-block ${getRoleBadge(user?.role)}`}>
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
            </button>

            {showUserMenu && (<div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button onClick={() => {
                navigate('/profile');
                setShowUserMenu(false);
            }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-sm text-slate-700">
                    <UserIcon className="w-4 h-4 text-slate-400"/>
                    My Profile
                  </button>

                  <button onClick={() => {
                navigate('/settings');
                setShowUserMenu(false);
            }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-sm text-slate-700">
                    <Settings className="w-4 h-4 text-slate-400"/>
                    System Settings
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2.5 text-sm text-rose-600 font-medium">
                    <LogOut className="w-4 h-4"/>
                    Log Out
                  </button>
                </div>
              </div>)}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)}/>
    </>);
}
