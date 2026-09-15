import { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Search, Filter, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { auditService } from '../../services/auditService';
export function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedId, setExpandedId] = useState(null);
    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [entityTypeFilter, setEntityTypeFilter] = useState('');
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 25 };
            if (actionFilter)
                params.action = actionFilter;
            if (entityTypeFilter)
                params.entityType = entityTypeFilter;
            const res = await auditService.getAuditLogs(params);
            setLogs(res.data || []);
            setTotalPages(res.pagination?.pages || 1);
        }
        catch (err) {
            console.error('Failed to load audit logs:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchLogs(); }, [page, actionFilter, entityTypeFilter]);
    const getActionBadge = (action) => {
        if (action.includes('CREATE') || action.includes('REGISTER'))
            return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (action.includes('UPDATE') || action.includes('ASSIGN'))
            return 'bg-blue-100 text-blue-800 border-blue-200';
        if (action.includes('DELETE') || action.includes('DEACTIVAT'))
            return 'bg-rose-100 text-rose-800 border-rose-200';
        if (action.includes('LOGIN') || action.includes('LOGOUT'))
            return 'bg-purple-100 text-purple-800 border-purple-200';
        if (action.includes('ESCALAT') || action.includes('BREACH'))
            return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-slate-100 text-slate-800 border-slate-200';
    };
    const getEntityIcon = (type) => {
        const map = {
            ticket: '🎫', asset: '💻', user: '👤', auth: '🔑', kb: '📚', sla: '⏱️', team: '👥', setting: '⚙️',
        };
        return map[type] || '📋';
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-indigo-600"/> Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">Complete activity and security log for compliance and forensics.</p>
        </div>
        <button onClick={fetchLogs} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-xs self-start" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400"/>
          <select value={actionFilter} onChange={(e) => { setPage(1); setActionFilter(e.target.value); }} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="">All Actions</option>
            <option value="USER_LOGIN">Login</option>
            <option value="USER_REGISTERED">Registration</option>
            <option value="TICKET_CREATED">Ticket Created</option>
            <option value="TICKET_UPDATED">Ticket Updated</option>
            <option value="TICKET_ASSIGNED">Ticket Assigned</option>
            <option value="TICKET_ESCALATED">Ticket Escalated</option>
            <option value="ASSET_CREATED">Asset Created</option>
            <option value="ASSET_UPDATED">Asset Updated</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400"/>
          <select value={entityTypeFilter} onChange={(e) => { setPage(1); setEntityTypeFilter(e.target.value); }} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="">All Entity Types</option>
            <option value="ticket">Tickets</option>
            <option value="asset">Assets</option>
            <option value="user">Users</option>
            <option value="auth">Authentication</option>
            <option value="kb">Knowledge Base</option>
            <option value="sla">SLA Policies</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (<div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500"/> Loading audit trail...
          </div>) : logs.length === 0 ? (<div className="py-12 text-center text-slate-400">
            <ShieldCheck className="w-8 h-8 mx-auto mb-3 opacity-40"/>
            <p className="font-medium text-slate-500">No audit logs found</p>
            <p className="text-sm mt-1">Adjust your filters or check back later.</p>
          </div>) : (<div className="divide-y divide-slate-100">
            {logs.map((log) => (<div key={log._id}>
                <button onClick={() => setExpandedId(expandedId === log._id ? null : log._id)} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors text-left">
                  {/* Expand indicator */}
                  {log.changes && Object.keys(log.changes).length > 0 ? (expandedId === log._id ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0"/> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0"/>) : (<div className="w-4 shrink-0"/>)}

                  {/* Entity icon */}
                  <span className="text-lg shrink-0">{getEntityIcon(log.entityType)}</span>

                  {/* Action badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${getActionBadge(log.action)}`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-700 font-medium truncate block">
                      {log.entityDisplay || log.entityId}
                    </span>
                  </div>

                  {/* User */}
                  <span className="text-xs text-slate-500 whitespace-nowrap hidden md:block">
                    {log.user?.name || 'System'}
                  </span>

                  {/* Timestamp */}
                  <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3"/>
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </button>

                {/* Expanded changes diff */}
                {expandedId === log._id && log.changes && Object.keys(log.changes).length > 0 && (<div className="px-16 pb-4">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs font-mono space-y-1.5">
                      {Object.entries(log.changes).map(([field, change]) => (<div key={field} className="flex items-start gap-2">
                          <span className="text-slate-500 font-semibold min-w-[120px]">{field}:</span>
                          <span className="text-rose-600 line-through">{JSON.stringify(change.from)}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-600 font-medium">{JSON.stringify(change.to)}</span>
                        </div>))}
                    </div>
                    {log.ipAddress && (<p className="text-xs text-slate-400 mt-2">IP: {log.ipAddress}</p>)}
                  </div>)}
              </div>))}
          </div>)}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (<div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>)}
    </div>);
}
