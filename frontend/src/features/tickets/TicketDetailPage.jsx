import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle2, Lock, MessageSquare, User, Send, Timer, Flame, RotateCcw, Check, } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../context/AuthContext';
export function TicketDetailPage() {
    const { id = '' } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [workMinutes, setWorkMinutes] = useState('');
    const [workDescription, setWorkDescription] = useState('');
    const [resolveNotes, setResolveNotes] = useState('');
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTech, setSelectedTech] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [notice, setNotice] = useState(null);
    const canManage = ['admin', 'it_manager', 'technician'].includes(user?.role || '');
    // Fetch ticket details
    const { data: ticket, isLoading, isError } = useQuery({
        queryKey: ['ticket', id],
        queryFn: () => ticketService.getTicketById(id),
    });
    // Fetch technicians for assignment
    const { data: techUsers } = useQuery({
        queryKey: ['technicians-list'],
        queryFn: () => userService.getUsers({ role: 'technician', limit: 50 }),
        enabled: canManage,
    });
    // Fetch teams
    const { data: teamsList } = useQuery({
        queryKey: ['teams-list'],
        queryFn: () => teamService.getTeams(),
        enabled: canManage,
    });
    const refreshTicket = () => {
        queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    };
    // Status mutation
    const statusMutation = useMutation({
        mutationFn: ({ status, notes }) => ticketService.updateStatus(ticket._id, status, notes),
        onSuccess: () => {
            setNotice({ type: 'success', message: 'Status updated successfully' });
            setShowResolveModal(false);
            refreshTicket();
        },
        onError: (err) => {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Status update failed' });
        },
    });
    // Assign mutation
    const assignMutation = useMutation({
        mutationFn: ({ techId, teamId }) => ticketService.assignTicket(ticket._id, techId, teamId),
        onSuccess: () => {
            setNotice({ type: 'success', message: 'Ticket assigned successfully' });
            setShowAssignModal(false);
            refreshTicket();
        },
        onError: (err) => {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Assignment failed' });
        },
    });
    // Comment mutation
    const commentMutation = useMutation({
        mutationFn: () => ticketService.addComment(ticket._id, commentText, canManage && isInternal),
        onSuccess: () => {
            setCommentText('');
            setIsInternal(false);
            refreshTicket();
        },
        onError: (err) => {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Failed to post reply' });
        },
    });
    // Work log mutation
    const workLogMutation = useMutation({
        mutationFn: () => ticketService.addWorkLog(ticket._id, Number(workMinutes), workDescription),
        onSuccess: () => {
            setWorkMinutes('');
            setWorkDescription('');
            setNotice({ type: 'success', message: 'Work logged successfully' });
            refreshTicket();
        },
        onError: (err) => {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Failed to log work' });
        },
    });
    // Escalate mutation
    const escalateMutation = useMutation({
        mutationFn: () => ticketService.escalateTicket(ticket._id, 'Escalated by staff workbench'),
        onSuccess: () => {
            setNotice({ type: 'success', message: 'Ticket escalated to Critical queue' });
            refreshTicket();
        },
    });
    // Reopen mutation
    const reopenMutation = useMutation({
        mutationFn: () => ticketService.reopenTicket(ticket._id),
        onSuccess: () => {
            setNotice({ type: 'success', message: 'Ticket reopened' });
            refreshTicket();
        },
    });
    if (isLoading) {
        return <div className="py-20 text-center text-slate-500 font-medium">Loading ticket workbench...</div>;
    }
    if (isError || !ticket) {
        return (<div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3"/>
        <h2 className="text-lg font-bold text-slate-900">Ticket Not Found or Access Denied</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          The requested ticket does not exist or your account role is not authorized to view it.
        </p>
        <button onClick={() => navigate('/tickets')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
          Return to Tickets
        </button>
      </div>);
    }
    // Calculate cumulative work time
    const totalWorkMinutes = (ticket.workLogs || []).reduce((acc, log) => acc + (log.timeSpentMinutes || 0), 0);
    const getSlaBadge = (status) => {
        switch (status) {
            case 'breached':
                return 'bg-rose-100 text-rose-800 border-rose-300';
            case 'at_risk':
                return 'bg-amber-100 text-amber-800 border-amber-300';
            default:
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        }
    };
    return (<div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate('/tickets')} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5"/> Back to ticket list
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-base font-black px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800">
              {ticket.ticketId}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {ticket.title}
            </h1>
          </div>
        </div>

        {/* Workflow Status Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canManage && (<button onClick={() => setShowAssignModal(true)} className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500"/>
              <span>{ticket.assignedTechnician ? 'Reassign' : 'Assign Tech'}</span>
            </button>)}

          {canManage && ticket.status === 'open' && (<button onClick={() => statusMutation.mutate({ status: 'in_progress' })} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
              Start Progress
            </button>)}

          {canManage && ticket.status === 'in_progress' && (<button onClick={() => statusMutation.mutate({ status: 'pending' })} className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
              Put on Hold
            </button>)}

          {canManage && !['resolved', 'closed'].includes(ticket.status) && (<button onClick={() => setShowResolveModal(true)} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5"/>
              <span>Resolve</span>
            </button>)}

          {canManage && !['closed', 'resolved', 'escalated'].includes(ticket.status) && (<button onClick={() => escalateMutation.mutate()} className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500"/>
              <span>Escalate</span>
            </button>)}

          {['resolved', 'closed'].includes(ticket.status) && (<button onClick={() => reopenMutation.mutate()} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5"/>
              <span>Reopen Ticket</span>
            </button>)}
        </div>
      </div>

      {notice && (<div className={`p-4 rounded-xl border text-sm flex items-center justify-between animate-in fade-in duration-150 ${notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)} className="font-bold">✕</button>
        </div>)}

      {/* Main Grid: Left Workbench (2 cols) & Right Meta (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description, Conversation, Work Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Problem Description
            </h2>
            <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>

            {ticket.resolutionNotes && (<div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600"/>
                  <span>Resolution Notes</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{ticket.resolutionNotes}</p>
                {ticket.resolvedAt && (<p className="text-xs text-emerald-700 mt-1">
                    Resolved on {new Date(ticket.resolvedAt).toLocaleString()}
                  </p>)}
              </div>)}
          </div>

          {/* Conversation Timeline & Reply Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600"/>
                <span>Conversation & Activity Timeline</span>
              </h2>
              <span className="text-xs text-slate-400">
                {ticket.comments?.length || 0} messages
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {(!ticket.comments || ticket.comments.length === 0) && (<div className="text-center py-8 text-slate-400 text-sm">
                  No comments or notes on this ticket yet.
                </div>)}

              {ticket.comments?.map((c) => (<div key={c._id} className={`p-4 rounded-2xl border transition-all ${c.isInternal
                ? 'bg-amber-50/60 border-amber-200'
                : 'bg-slate-50/70 border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {c.author?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">
                          {c.author?.name || 'Staff Member'}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-2">
                          ({c.author?.role?.replace('_', ' ') || 'User'})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.isInternal && (<span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Lock className="w-3 h-3"/> Private Internal Note
                        </span>)}
                      <span className="text-xs text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap pl-9">{c.content}</p>
                </div>))}
            </div>

            {/* Reply Editor Box */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <textarea rows={3} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a message to requester or log an update..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"/>

              <div className="flex items-center justify-between">
                {canManage ? (<label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                    <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"/>
                    <span className={isInternal ? 'text-amber-700 font-bold' : ''}>
                      🔒 Mark as Internal Note (hidden from employees)
                    </span>
                  </label>) : <div />}

                <button onClick={() => commentMutation.mutate()} disabled={!commentText.trim() || commentMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50">
                  <Send className="w-3.5 h-3.5"/>
                  <span>{commentMutation.isPending ? 'Sending...' : 'Post Reply'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Time Tracking / Work Logs (Technician/Manager Only) */}
          {canManage && (<div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-indigo-600"/>
                  <span>Work Logs & Time Tracking</span>
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                  Total Logged: {Math.floor(totalWorkMinutes / 60)}h {totalWorkMinutes % 60}m
                </span>
              </div>

              {ticket.workLogs?.length > 0 && (<div className="divide-y divide-slate-100">
                  {ticket.workLogs.map((log) => (<div key={log._id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{log.technician?.name || 'Technician'}</span>
                        <span className="text-slate-400 ml-2">{log.description}</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-600">
                        {log.timeSpentMinutes} mins
                      </span>
                    </div>))}
                </div>)}

              {/* Add Work Log Row */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                <input type="number" min="1" value={workMinutes} onChange={(e) => setWorkMinutes(e.target.value)} placeholder="Minutes" className="w-full sm:w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"/>
                <input type="text" value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} placeholder="Summary of work performed..." className="flex-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"/>
                <button onClick={() => workLogMutation.mutate()} disabled={!workMinutes || !workDescription || workLogMutation.isPending} className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                  Log Time
                </button>
              </div>
            </div>)}
        </div>

        {/* Right Column: SLA Timer, Properties & AI Suggestions */}
        <div className="space-y-6">
          {/* Live SLA Countdown Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                SLA Compliance Engine
              </h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase ${getSlaBadge(ticket.slaEvaluation?.status || ticket.slaStatus)}`}>
                {(ticket.slaEvaluation?.status || ticket.slaStatus).replace('_', ' ')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">SLA Policy:</span>
                <span className="font-semibold text-slate-800">{ticket.slaPolicy?.name || 'Standard SLA'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Resolution Deadline:</span>
                <span className="font-mono text-slate-800">
                  {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : 'N/A'}
                </span>
              </div>
              {ticket.slaEvaluation?.timeRemaining && (<div className="pt-2 border-t border-slate-200 text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600"/>
                  <span>Time Remaining: {ticket.slaEvaluation.timeRemaining}</span>
                </div>)}
            </div>
          </div>

          {/* Ticket Metadata Properties */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ticket Properties
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Requester:</span>
                <span className="font-semibold text-slate-800">{ticket.requester?.name || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Assigned Tech:</span>
                <span className="font-semibold text-slate-800">
                  {ticket.assignedTechnician?.name || <span className="text-amber-600">Unassigned</span>}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Assigned Team:</span>
                <span className="font-semibold text-slate-800">{ticket.assignedTeam?.name || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-800">{ticket.department?.name || '—'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-slate-800">{ticket.category}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Urgency:</span>
                <span className="font-semibold capitalize text-slate-800">{ticket.priority}</span>
              </div>

              {ticket.asset && (<div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Linked Asset:</span>
                  <button onClick={() => navigate(`/assets/${ticket.asset._id}`)} className="font-bold text-indigo-600 hover:underline">
                    {ticket.asset.name}
                  </button>
                </div>)}

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Created At:</span>
                <span className="text-slate-600">{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Dialog Modal */}
      {showResolveModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600"/>
              <span>Mark Ticket as Resolved</span>
            </h3>
            <p className="text-xs text-slate-500">
              Provide resolution details explaining how the issue was fixed for the requester.
            </p>
            <textarea rows={4} value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} placeholder="e.g. Reset VPN certificate, updated firmware to 6.1.2, and verified connectivity..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required/>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowResolveModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => statusMutation.mutate({ status: 'resolved', notes: resolveNotes })} disabled={!resolveNotes.trim() || statusMutation.isPending} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50">
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>)}

      {/* Assign Dialog Modal */}
      {showAssignModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600"/>
              <span>Assign Ticket</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Assign Technician
                </label>
                <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <option value="">-- Choose Technician --</option>
                  {techUsers?.data?.map((tech) => (<option key={tech._id} value={tech._id}>
                      {tech.name} ({tech.email})
                    </option>))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Assign Team
                </label>
                <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <option value="">-- Choose Team --</option>
                  {teamsList?.map((tm) => (<option key={tm._id} value={tm._id}>
                      {tm.name}
                    </option>))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button onClick={() => assignMutation.mutate({
                techId: selectedTech || undefined,
                teamId: selectedTeam || undefined,
            })} disabled={assignMutation.isPending} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
                Save Assignment
              </button>
            </div>
          </div>
        </div>)}
    </div>);
}
