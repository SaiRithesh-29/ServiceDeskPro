import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Download, TrendingUp, Clock, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, } from 'recharts';
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
export function ReportsAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);
    const [byStatus, setByStatus] = useState([]);
    const [byPriority, setByPriority] = useState([]);
    const [byCategory, setByCategory] = useState([]);
    const [techWorkload, setTechWorkload] = useState([]);
    const [slaCompliance, setSlaCompliance] = useState(null);
    const [volumeTrend, setVolumeTrend] = useState([]);
    const fetchAll = async () => {
        setLoading(true);
        try {
            const [m, s, p, c, tw, sla, vt] = await Promise.allSettled([
                reportService.getDashboardMetrics(),
                reportService.getTicketsByStatus(),
                reportService.getTicketsByPriority(),
                reportService.getTicketsByCategory(),
                reportService.getTechnicianWorkload(),
                reportService.getSLACompliance(),
                reportService.getVolumeTrend(),
            ]);
            if (m.status === 'fulfilled')
                setMetrics(m.value);
            if (s.status === 'fulfilled')
                setByStatus(m.status === 'fulfilled' ? s.value || [] : []);
            if (p.status === 'fulfilled')
                setByPriority(p.value || []);
            if (c.status === 'fulfilled')
                setByCategory(c.value || []);
            if (tw.status === 'fulfilled')
                setTechWorkload(tw.value || []);
            if (sla.status === 'fulfilled')
                setSlaCompliance(sla.value);
            if (vt.status === 'fulfilled')
                setVolumeTrend(vt.value || []);
        }
        catch (err) {
            console.error('Failed to fetch report data:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchAll(); }, []);
    const handleExport = (type) => {
        const url = reportService.getExportUrl(type);
        window.open(url, '_blank');
    };
    if (loading) {
        return (<div className="flex items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-3 text-indigo-500"/> Loading reports & analytics...
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-600"/> Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Performance metrics, SLA compliance, and service desk insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAll} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-xs" title="Refresh">
            <RefreshCw className="w-4 h-4"/>
          </button>
          <button onClick={() => handleExport('tickets')} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all">
            <Download className="w-4 h-4"/> Export Tickets
          </button>
          <button onClick={() => handleExport('assets')} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all">
            <Download className="w-4 h-4"/> Export Assets
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && (<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-500"/> Total Tickets
            </div>
            <p className="text-3xl font-black text-slate-900">{metrics.totalTickets || 0}</p>
            <p className="text-xs text-slate-400 mt-1">{metrics.openTickets || 0} currently open</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-amber-500"/> Avg Resolution
            </div>
            <p className="text-3xl font-black text-slate-900">{metrics.avgResolutionTime ? `${Math.round(metrics.avgResolutionTime)}h` : 'N/A'}</p>
            <p className="text-xs text-slate-400 mt-1">Mean time to resolve</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500"/> SLA Compliance
            </div>
            <p className="text-3xl font-black text-slate-900">{slaCompliance?.complianceRate ? `${Math.round(slaCompliance.complianceRate)}%` : 'N/A'}</p>
            <p className="text-xs text-slate-400 mt-1">{slaCompliance?.onTrack || 0} on track</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-500"/> SLA Breached
            </div>
            <p className="text-3xl font-black text-slate-900">{slaCompliance?.breached || 0}</p>
            <p className="text-xs text-slate-400 mt-1">{slaCompliance?.atRisk || 0} at risk</p>
          </div>
        </div>)}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Status */}
        {byStatus.length > 0 && (<div className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Tickets by Status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }}/>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}/>
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>)}

        {/* Tickets by Priority */}
        {byPriority.length > 0 && (<div className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Tickets by Priority</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byPriority} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label>
                  {byPriority.map((_entry, i) => (<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]}/>))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>)}

        {/* Volume Trend */}
        {volumeTrend.length > 0 && (<div className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Ticket Volume Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={volumeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }}/>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}/>
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>)}

        {/* Tickets by Category */}
        {byCategory.length > 0 && (<div className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Tickets by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis type="number" tick={{ fontSize: 11 }}/>
                <YAxis dataKey="_id" type="category" tick={{ fontSize: 11 }} width={120}/>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}/>
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>)}
      </div>

      {/* Technician Workload */}
      {techWorkload.length > 0 && (<div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600"/> Technician Workload & Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Assigned</th>
                  <th className="py-3 px-4">Resolved</th>
                  <th className="py-3 px-4">In Progress</th>
                  <th className="py-3 px-4">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {techWorkload.map((tw, i) => {
                const rate = tw.assigned > 0 ? Math.round((tw.resolved / tw.assigned) * 100) : 0;
                return (<tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{tw.name || tw._id}</td>
                      <td className="py-3 px-4">{tw.assigned || 0}</td>
                      <td className="py-3 px-4 text-emerald-600 font-medium">{tw.resolved || 0}</td>
                      <td className="py-3 px-4 text-amber-600 font-medium">{tw.inProgress || 0}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${rate}%` }}/>
                          </div>
                          <span className="text-xs font-bold text-slate-700">{rate}%</span>
                        </div>
                      </td>
                    </tr>);
            })}
              </tbody>
            </table>
          </div>
        </div>)}
    </div>);
}
