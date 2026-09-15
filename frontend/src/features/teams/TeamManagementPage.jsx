import { useState, useEffect } from 'react';
import { Building2, Users, Plus, X, RefreshCw, ChevronRight, UserCircle, AlertCircle, Briefcase } from 'lucide-react';
import { teamService } from '../../services/teamService';
import { userService } from '../../services/userService';
export function TeamManagementPage() {
    const [departments, setDepartments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
    const [teamForm, setTeamForm] = useState({ name: '', description: '', department: '', lead: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fetchAll = async () => {
        setLoading(true);
        try {
            const [deptRes, teamRes, userRes] = await Promise.all([
                teamService.getDepartments(),
                teamService.getTeams(),
                userService.getUsers({ limit: 200 }),
            ]);
            setDepartments(deptRes || []);
            setTeams(teamRes || []);
            setUsers(userRes?.data || userRes?.users || userRes || []);
        }
        catch (err) {
            console.error('Failed to fetch teams data:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchAll(); }, []);
    const handleCreateDept = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);
        try {
            await teamService.createDepartment({ name: deptForm.name, code: deptForm.code.toUpperCase(), description: deptForm.description || undefined });
            setShowDeptModal(false);
            setDeptForm({ name: '', code: '', description: '' });
            fetchAll();
        }
        catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create department');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);
        try {
            await teamService.createTeam({
                name: teamForm.name,
                description: teamForm.description || undefined,
                department: teamForm.department || undefined,
                lead: teamForm.lead || undefined,
            });
            setShowTeamModal(false);
            setTeamForm({ name: '', description: '', department: '', lead: '' });
            fetchAll();
        }
        catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create team');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600"/>
            Teams & Departments
          </h1>
          <p className="text-sm text-slate-500 mt-1">Organize your workforce into departments and support teams.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAll} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-xs" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
          </button>
          <button onClick={() => { setFormError(''); setShowDeptModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all">
            <Plus className="w-4 h-4"/> Department
          </button>
          <button onClick={() => { setFormError(''); setShowTeamModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all">
            <Plus className="w-4 h-4"/> Team
          </button>
        </div>
      </div>

      {/* Departments Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-amber-600"/> Departments
        </h2>
        {loading ? (<div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500"/> Loading departments...
          </div>) : departments.length === 0 ? (<div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400">
            No departments created yet. Click "+ Department" to create one.
          </div>) : (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
                const deptTeams = teams.filter((t) => t.department?._id === dept._id || t.department === dept._id);
                return (<div key={dept._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">{dept.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Code: {dept.code}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">{deptTeams.length} teams</span>
                  </div>
                  {dept.description && <p className="text-sm text-slate-500 mt-2">{dept.description}</p>}
                  {deptTeams.length > 0 && (<div className="mt-3 space-y-1.5">
                      {deptTeams.map((t) => (<div key={t._id} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                          <ChevronRight className="w-3 h-3 text-slate-400"/>
                          <span className="font-medium">{t.name}</span>
                          {t.lead && <span className="text-slate-400 ml-auto">Lead: {t.lead.name}</span>}
                        </div>))}
                    </div>)}
                </div>);
            })}
          </div>)}
      </div>

      {/* Teams Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600"/> Support Teams
        </h2>
        {loading ? (<div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500"/> Loading teams...
          </div>) : teams.length === 0 ? (<div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400">
            No teams created yet. Click "+ Team" to create one.
          </div>) : (<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Team Name</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Team Lead</th>
                  <th className="py-3.5 px-6">Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((team) => (<tr key={team._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{team.name}</p>
                      {team.description && <p className="text-xs text-slate-400 mt-0.5">{team.description}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-600">{typeof team.department === 'object' ? team.department?.name : 'Unassigned'}</span>
                    </td>
                    <td className="py-4 px-6">
                      {team.lead ? (<div className="flex items-center gap-2">
                          <UserCircle className="w-4 h-4 text-indigo-500"/>
                          <span className="text-slate-700 font-medium">{team.lead.name}</span>
                        </div>) : (<span className="text-slate-400 text-xs">No lead assigned</span>)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                        {team.members?.length || 0} members
                      </span>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>)}
      </div>

      {/* Create Department Modal */}
      {showDeptModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Briefcase className="w-5 h-5 text-amber-600"/> New Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5"/></button>
            </div>
            {formError && (<div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0"/> {formError}
              </div>)}
            <form onSubmit={handleCreateDept} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Department Name *</label>
                <input type="text" required value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="e.g. IT Support" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Code *</label>
                <input type="text" required value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} placeholder="e.g. ITS" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} placeholder="Brief description..." className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" rows={2}/>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* Create Team Modal */}
      {showTeamModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600"/> New Support Team</h3>
              <button onClick={() => setShowTeamModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5"/></button>
            </div>
            {formError && (<div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0"/> {formError}
              </div>)}
            <form onSubmit={handleCreateTeam} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Team Name *</label>
                <input type="text" required value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="e.g. Tier 1 Support" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea value={teamForm.description} onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })} placeholder="Team responsibilities..." className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" rows={2}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Department</label>
                  <select value={teamForm.department} onChange={(e) => setTeamForm({ ...teamForm, department: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">None</option>
                    {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Team Lead</label>
                  <select value={teamForm.lead} onChange={(e) => setTeamForm({ ...teamForm, lead: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">None</option>
                    {users.filter((u) => ['it_manager', 'technician', 'admin'].includes(u.role)).map((u) => (<option key={u._id} value={u._id}>{u.name} ({u.role})</option>))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowTeamModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
