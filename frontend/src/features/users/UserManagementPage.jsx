import { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Shield, Building, Mail, Phone, CheckCircle2, XCircle, Edit2, Lock, RefreshCw, X, AlertCircle } from 'lucide-react';
import { userService } from '../../services/userService';
import { teamService } from '../../services/teamService';
export function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee', department: '', phone: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = { limit: 100 };
            if (selectedRole !== 'all')
                params.role = selectedRole;
            if (search.trim())
                params.search = search.trim();
            const res = await userService.getUsers(params);
            setUsers(res.data || res.users || res);
        }
        catch (err) {
            console.error('Failed to load users:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchDepartments = async () => {
        try {
            const depts = await teamService.getDepartments();
            setDepartments(depts || []);
        }
        catch { /* ignore */ }
    };
    useEffect(() => { fetchUsers(); fetchDepartments(); }, [selectedRole]);
    const handleSearchSubmit = (e) => { e.preventDefault(); fetchUsers(); };
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);
        try {
            await userService.createUser({
                name: formData.name, email: formData.email, password: formData.password,
                role: formData.role, department: formData.department || undefined, phone: formData.phone || undefined,
            });
            setShowAddModal(false);
            setFormData({ name: '', email: '', password: '', role: 'employee', department: '', phone: '' });
            fetchUsers();
        }
        catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create user');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleUpdateRole = async (userId, newRole) => {
        try {
            await userService.updateUser(userId, { role: newRole });
            setEditingUser(null);
            fetchUsers();
        }
        catch { /* ignore */ }
    };
    const handleToggleActive = async (user) => {
        try {
            await userService.toggleStatus(user._id);
            fetchUsers();
        }
        catch { /* ignore */ }
    };
    const getRoleBadge = (role) => {
        const map = {
            admin: 'bg-purple-100 text-purple-800 border-purple-200',
            it_manager: 'bg-blue-100 text-blue-800 border-blue-200',
            technician: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            asset_manager: 'bg-amber-100 text-amber-800 border-amber-200',
        };
        return map[role] || 'bg-emerald-100 text-emerald-800 border-emerald-200';
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600"/>
            User Directory & Access Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage staff, role assignments, departments, and credentials.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchUsers} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-xs" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all">
            <UserPlus className="w-4 h-4"/> <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"/>
        </form>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Role:</span>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="all">All Roles</option>
            <option value="admin">System Admin</option>
            <option value="it_manager">IT Manager</option>
            <option value="technician">Technician</option>
            <option value="asset_manager">Asset Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">User / Contact</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Active</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (<tr><td colSpan={6} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500"/> Loading user directory...
                </td></tr>) : users.length === 0 ? (<tr><td colSpan={6} className="py-12 text-center text-slate-400">No users found.</td></tr>) : users.map((u) => (<tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{u.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {u.email}</span>
                          {u.phone && <span className="flex items-center gap-1">• <Phone className="w-3 h-3"/> {u.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(u.role)}`}>
                      <Shield className="w-3 h-3"/> {u.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Building className="w-3.5 h-3.5 text-slate-400"/>
                      <span>{u.department?.name || 'General'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {u.isActive ? (<span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5"/> Active
                      </span>) : (<span className="inline-flex items-center gap-1 text-rose-600 text-xs font-medium bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                        <XCircle className="w-3.5 h-3.5"/> Suspended
                      </span>)}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-400">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingUser(u)} className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors" title="Edit Role">
                        <Edit2 className="w-4 h-4"/>
                      </button>
                      <button onClick={() => handleToggleActive(u)} className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'hover:bg-rose-50 text-slate-400 hover:text-rose-600' : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'}`} title={u.isActive ? 'Deactivate' : 'Activate'}>
                        <Lock className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showAddModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><UserPlus className="w-5 h-5 text-indigo-600"/> Add New Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5"/></button>
            </div>
            {formError && (<div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0"/> <span>{formError}</span>
              </div>)}
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Sarah Jenkins" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Work Email *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="sarah@company.com" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Initial Password *</label>
                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Min 8 characters" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Role *</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="employee">Employee</option>
                    <option value="technician">Technician</option>
                    <option value="it_manager">IT Manager</option>
                    <option value="asset_manager">Asset Manager</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Department</label>
                  <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">None</option>
                    {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* Edit Role Modal */}
      {editingUser && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Change User Role</h3>
            <p className="text-xs text-slate-500 mb-4">Update role for <strong className="text-slate-700">{editingUser.name}</strong></p>
            <div className="space-y-2 mb-6">
              {['employee', 'technician', 'it_manager', 'asset_manager', 'admin'].map((r) => (<button key={r} onClick={() => handleUpdateRole(editingUser._id, r)} className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${editingUser.role === r ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                  {r.replace('_', ' ').toUpperCase()}
                </button>))}
            </div>
            <button onClick={() => setEditingUser(null)} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl">Cancel</button>
          </div>
        </div>)}
    </div>);
}
