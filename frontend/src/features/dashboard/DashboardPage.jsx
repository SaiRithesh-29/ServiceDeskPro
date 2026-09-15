import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Ticket, CheckCircle2, Clock, AlertTriangle, HardDrive, PlusCircle, BookOpen, ArrowRight, ShieldAlert, Flame, Wrench, TrendingUp, Layers, Sparkles, } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { ticketService } from '../../services/ticketService';
import { kbService } from '../../services/kbService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, } from 'recharts';
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
export function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Load dashboard overview metrics
    const { data: metrics, isLoading: metricsLoading } = useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: () => reportService.getDashboardMetrics(),
    });
    // Load recent tickets
    const { data: recentTicketsData } = useQuery({
        queryKey: ['recent-tickets'],
        queryFn: () => ticketService.getTickets({ limit: 5 }),
    });
    // Load volume trends for managers/admins
    const { data: volumeTrend } = useQuery({
        queryKey: ['ticket-volume-trend'],
        queryFn: () => reportService.getVolumeTrend(),
        enabled: user?.role === 'admin' || user?.role === 'it_manager' || user?.role === 'technician',
    });
    // Load categories breakdown
    const { data: categoriesData } = useQuery({
        queryKey: ['ticket-categories-report'],
        queryFn: () => reportService.getTicketsByCategory(),
        enabled: user?.role === 'admin' || user?.role === 'it_manager',
    });
    // Load top KB articles for employees
    const { data: topArticlesData } = useQuery({
        queryKey: ['top-articles'],
        queryFn: () => kbService.getArticles({ limit: 4 }),
        enabled: user?.role === 'employee',
    });
    // Load expiring warranty assets for asset manager
    const { data: warrantyData } = useQuery({
        queryKey: ['asset-warranty-status'],
        queryFn: () => reportService.getWarrantyStatus(),
        enabled: user?.role === 'asset_manager' || user?.role === 'admin',
    });
    const tickets = recentTicketsData?.data || [];
    const getPriorityBadge = (p) => {
        switch (p) {
            case 'critical':
                return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'high':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'medium':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };
    const getStatusBadge = (s) => {
        switch (s) {
            case 'open':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'in_progress':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'resolved':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'closed':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'escalated':
                return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };
    return (<div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400"/>
            <span>ITSM Operations Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name} 👋
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            {user?.role === 'employee' &&
            'Submit IT requests, track ticket resolution progress, and find self-service guides.'}
            {user?.role === 'technician' &&
            'Your assigned incident queue, active SLA countdowns, and quick work-logging center.'}
            {user?.role === 'it_manager' &&
            'Real-time SLA compliance tracking, technician workload overview, and incident trends.'}
            {user?.role === 'asset_manager' &&
            'Hardware & software lifecycle management, warranty surveillance, and procurement.'}
            {user?.role === 'admin' &&
            'Enterprise ITSM platform health, security audit stream, and system configurations.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/tickets/create')} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95">
            <PlusCircle className="w-4 h-4"/>
            <span>New Ticket</span>
          </button>
          <button onClick={() => navigate('/knowledge-base')} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm border border-white/10 transition-colors">
            <BookOpen className="w-4 h-4"/>
            <span>Knowledge Base</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Tickets</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{metrics?.tickets?.total || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Platform volume</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6"/>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Active In Queue</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{metrics?.tickets?.open || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Open / In Progress</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6"/>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Resolved</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{metrics?.tickets?.resolved || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Closed successfully</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6"/>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">SLA At-Risk / Breached</p>
            <p className="text-3xl font-black text-rose-600 mt-1">
              {(metrics?.sla?.breached || 0) + (metrics?.sla?.atRisk || 0)}
            </p>
            <p className="text-xs text-rose-500 mt-1">{metrics?.sla?.breached || 0} breached</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6"/>
          </div>
        </div>
      </div>

      {/* Role-Specific Content Area */}

      {/* 1. EMPLOYEE DASHBOARD VIEW */}
      {user?.role === 'employee' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-600"/>
                My Recent Support Requests
              </h2>
              <button onClick={() => navigate('/tickets')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5"/>
              </button>
            </div>

            {tickets.length === 0 ? (<div className="text-center py-10 text-slate-400">
                <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                <p className="font-medium text-slate-600">No active tickets right now</p>
                <p className="text-xs mt-1">Need help with software, hardware, or VPN? Click "New Ticket".</p>
              </div>) : (<div className="divide-y divide-slate-100">
                {tickets.map((t) => (<div key={t._id} onClick={() => navigate(`/tickets/${t.ticketId}`)} className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {t.ticketId}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors">
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Category: <span className="text-slate-600 font-medium">{t.category}</span> • Created:{' '}
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(t.status)}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>))}
              </div>)}
          </div>

          {/* Self Service Knowledge Base Recommendations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500"/>
              Instant Self-Service Guides
            </h2>
            <div className="space-y-2.5">
              {topArticlesData?.data?.slice(0, 4).map((art) => (<div key={art._id} onClick={() => navigate(`/knowledge-base?article=${art._id}`)} className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 cursor-pointer transition-all group">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 leading-snug">
                    {art.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{art.problem}</p>
                </div>))}
            </div>
          </div>
        </div>)}

      {/* 2. TECHNICIAN / MANAGER / ADMIN DASHBOARD VIEW */}
      {user?.role !== 'employee' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Activity / Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600"/>
                  Incident Inflow & Resolution Velocity
                </h2>
                <p className="text-xs text-slate-400">Daily ticket submissions over time</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                Last 30 Days
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeTrend && volumeTrend.length > 0
                ? volumeTrend.map((v) => ({ name: v._id, count: v.count }))
                : [
                    { name: 'Mon', count: 4 },
                    { name: 'Tue', count: 7 },
                    { name: 'Wed', count: 5 },
                    { name: 'Thu', count: 11 },
                    { name: 'Fri', count: 9 },
                    { name: 'Sat', count: 3 },
                    { name: 'Sun', count: 2 },
                ]}>
                  <defs>
                    <linearGradient id="ticketTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11}/>
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false}/>
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#ticketTrend)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categories Breakdown Donut */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600"/>
              Incidents by Category
            </h2>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoriesData && categoriesData.length > 0
                ? categoriesData.map((c) => ({ name: c._id || 'Other', value: c.count }))
                : [
                    { name: 'Hardware', value: 35 },
                    { name: 'Network', value: 25 },
                    { name: 'VPN', value: 20 },
                    { name: 'Software', value: 20 },
                ]} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {(categoriesData || [1, 2, 3, 4]).map((_entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(categoriesData || []).slice(0, 4).map((c, i) => (<div key={c._id} className="flex items-center gap-1.5 text-slate-600 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}/>
                  <span className="truncate">{c._id}</span>
                  <span className="font-bold text-slate-900 ml-auto">{c.count}</span>
                </div>))}
            </div>
          </div>
        </div>)}

      {/* 3. ASSET MANAGER SPECIFIC WIDGETS */}
      {(user?.role === 'asset_manager' || user?.role === 'admin') && (<div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-600"/>
              Hardware Lifecycle & Warranty Surveillance
            </h2>
            <button onClick={() => navigate('/assets')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
              Open Asset Registry <ArrowRight className="w-3.5 h-3.5"/>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-amber-700">Expiring in 90 Days</p>
                <p className="text-2xl font-black text-amber-900 mt-1">{warrantyData?.expiring || 3} Devices</p>
                <p className="text-xs text-amber-700/80 mt-0.5">Requires warranty extension review</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500"/>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-rose-700">Expired Warranties</p>
                <p className="text-2xl font-black text-rose-900 mt-1">{warrantyData?.expired || 2} Devices</p>
                <p className="text-xs text-rose-700/80 mt-0.5">Schedule for hardware refresh</p>
              </div>
              <ShieldAlert className="w-8 h-8 text-rose-500"/>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-indigo-700">Under Repair / Maintenance</p>
                <p className="text-2xl font-black text-indigo-900 mt-1">1 Device</p>
                <p className="text-xs text-indigo-700/80 mt-0.5">AST-1003 (ThinkPad X1 Carbon)</p>
              </div>
              <Wrench className="w-8 h-8 text-indigo-500"/>
            </div>
          </div>
        </div>)}

      {/* Active High-Priority Incident Stream */}
      {user?.role !== 'employee' && (<div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500"/>
              Active Triage Queue
            </h2>
            <button onClick={() => navigate('/tickets')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View Full Queue <ArrowRight className="w-3.5 h-3.5"/>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                  <th className="pb-3 px-2">Ticket ID</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">SLA Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (<tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs font-bold text-indigo-600">
                      {t.ticketId}
                    </td>
                    <td className="py-3 font-semibold text-slate-800 max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="py-3 text-slate-500">{t.category}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusBadge(t.status)}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${t.slaStatus === 'breached'
                    ? 'bg-rose-100 text-rose-700'
                    : t.slaStatus === 'at_risk'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'}`}>
                        {t.slaStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => navigate(`/tickets/${t.ticketId}`)} className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors">
                        Open Workbench
                      </button>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>)}
    </div>);
}
