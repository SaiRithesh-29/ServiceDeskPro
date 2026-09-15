import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Ticket, Plus, Search, Download, User, } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
export function TicketListPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [status, setStatus] = useState(searchParams.get('status') || '');
    const [priority, setPriority] = useState(searchParams.get('priority') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [slaStatus, setSlaStatus] = useState(searchParams.get('slaStatus') || '');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const { data: response, isLoading } = useQuery({
        queryKey: ['tickets-list', { search, status, priority, category, slaStatus, page }],
        queryFn: () => ticketService.getTickets({
            search: search || undefined,
            status: status || undefined,
            priority: priority || undefined,
            category: category || undefined,
            slaStatus: slaStatus || undefined,
            page,
            limit: 15,
        }),
    });
    const tickets = response?.data || [];
    const pagination = response?.pagination;
    const handleStatusFilter = (newStatus) => {
        setStatus(newStatus);
        setSearchParams({
            ...Object.fromEntries(searchParams),
            status: newStatus,
            page: '1',
        });
    };
    const getPriorityBadge = (p) => {
        switch (p) {
            case 'critical':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'high':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'medium':
                return 'bg-blue-100 text-blue-800 border-blue-200';
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
    return (<div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-indigo-600"/>
            <span>Service Tickets</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, triage, and manage organization support requests and incidents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href={reportService.getExportUrl('tickets')} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors">
            <Download className="w-4 h-4 text-slate-500"/>
            <span>Export CSV</span>
          </a>

          <button onClick={() => navigate('/tickets/create')} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4"/>
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Quick Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
            { label: 'All Tickets', val: '' },
            { label: 'Open', val: 'open' },
            { label: 'In Progress', val: 'in_progress' },
            { label: 'Pending', val: 'pending' },
            { label: 'Resolved', val: 'resolved' },
            { label: 'Closed', val: 'closed' },
            { label: 'Escalated', val: 'escalated' },
        ].map((pill) => {
            const isActive = status === pill.val;
            return (<button key={pill.label} onClick={() => handleStatusFilter(pill.val)} className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {pill.label}
            </button>);
        })}
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, keyword, title..." className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"/>
        </div>

        {/* Priority Filter */}
        <div>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Categories</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
            <option value="VPN">VPN</option>
            <option value="Account & Access">Account & Access</option>
            <option value="Security">Security</option>
            <option value="Printer">Printer</option>
            <option value="Email">Email</option>
          </select>
        </div>

        {/* SLA Status Filter */}
        <div>
          <select value={slaStatus} onChange={(e) => setSlaStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All SLA States</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="breached">Breached</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (<div className="py-16 text-center text-slate-400 text-sm">Loading tickets...</div>) : tickets.length === 0 ? (<div className="py-16 text-center text-slate-400 space-y-2">
            <Ticket className="w-10 h-10 mx-auto opacity-30"/>
            <p className="font-semibold text-slate-700">No tickets found</p>
            <p className="text-xs">Try adjusting search criteria or create a new request.</p>
          </div>) : (<div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Title & Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Engine</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (<tr key={t._id} onClick={() => navigate(`/tickets/${t.ticketId}`)} className="hover:bg-slate-50/80 cursor-pointer transition-colors group">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-indigo-600">
                      {t.ticketId}
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Category: <span className="text-slate-600 font-medium">{t.category}</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-md border font-semibold capitalize ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(t.status)}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${t.slaStatus === 'breached'
                    ? 'bg-rose-100 text-rose-700'
                    : t.slaStatus === 'at_risk'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'}`}>
                        {t.slaStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {t.assignedTechnician?.name ? (<div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400"/>
                          <span>{t.assignedTechnician.name}</span>
                        </div>) : (<span className="text-amber-600 font-medium">Unassigned</span>)}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tickets/${t.ticketId}`);
                }} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-all">
                        Open
                      </button>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>)}

        {/* Pagination Controls */}
        {pagination && pagination.pages > 1 && (<div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing Page {page} of {pagination.pages} ({pagination.total} total tickets)
            </span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setSearchParams({
                ...Object.fromEntries(searchParams),
                page: String(page - 1),
            })} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold disabled:opacity-40">
                Previous
              </button>
              <button disabled={page >= pagination.pages} onClick={() => setSearchParams({
                ...Object.fromEntries(searchParams),
                page: String(page + 1),
            })} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold disabled:opacity-40">
                Next
              </button>
            </div>
          </div>)}
      </div>
    </div>);
}
