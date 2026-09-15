import { useState, useEffect } from 'react';
import { Clock, RefreshCw, Plus, X, AlertCircle, Shield, Edit2 } from 'lucide-react';
import { slaService } from '../../services/slaService';
export function SLAPoliciesPage() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [formData, setFormData] = useState({
        name: '', priority: 'medium',
        responseTimeMinutes: 240, resolutionTimeMinutes: 1440,
        operatingHours: 'business_hours', isDefault: false,
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const data = await slaService.getPolicies();
            setPolicies(data || []);
        }
        catch (err) {
            console.error('Failed to load SLA policies:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchPolicies(); }, []);
    const openCreate = () => {
        setEditingPolicy(null);
        setFormData({ name: '', priority: 'medium', responseTimeMinutes: 240, resolutionTimeMinutes: 1440, operatingHours: 'business_hours', isDefault: false });
        setFormError('');
        setShowModal(true);
    };
    const openEdit = (p) => {
        setEditingPolicy(p);
        setFormData({ name: p.name, priority: p.priority, responseTimeMinutes: p.responseTimeMinutes, resolutionTimeMinutes: p.resolutionTimeMinutes, operatingHours: p.operatingHours, isDefault: p.isDefault });
        setFormError('');
        setShowModal(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);
        try {
            if (editingPolicy) {
                await slaService.updatePolicy(editingPolicy._id, formData);
            }
            else {
                await slaService.createPolicy(formData);
            }
            setShowModal(false);
            fetchPolicies();
        }
        catch (err) {
            setFormError(err.response?.data?.message || 'Failed to save SLA policy');
        }
        finally {
            setSubmitting(false);
        }
    };
    const formatTime = (minutes) => {
        if (minutes < 60)
            return `${minutes}m`;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    };
    const getPriorityColor = (priority) => {
        const map = {
            critical: 'bg-rose-100 text-rose-800 border-rose-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            medium: 'bg-amber-100 text-amber-800 border-amber-200',
            low: 'bg-sky-100 text-sky-800 border-sky-200',
        };
        return map[priority] || 'bg-slate-100 text-slate-800 border-slate-200';
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-indigo-600"/> SLA Policy Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure service level agreements with response and resolution time targets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchPolicies} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-xs" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all">
            <Plus className="w-4 h-4"/> New SLA Policy
          </button>
        </div>
      </div>

      {/* SLA Policy Cards */}
      {loading ? (<div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500"/> Loading SLA policies...
        </div>) : policies.length === 0 ? (<div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <Shield className="w-8 h-8 mx-auto mb-3 opacity-40"/>
          <p className="font-medium text-slate-500">No SLA policies configured</p>
          <p className="text-sm mt-1">Create your first policy to start tracking SLA compliance.</p>
        </div>) : (<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {policies.map((p) => (<div key={p._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow relative group">
              <button onClick={() => openEdit(p)} className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-all" title="Edit">
                <Edit2 className="w-4 h-4"/>
              </button>
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full mt-1 ${p.priority === 'critical' ? 'bg-rose-500' : p.priority === 'high' ? 'bg-orange-500' : p.priority === 'medium' ? 'bg-amber-500' : 'bg-sky-500'}`}/>
                <div>
                  <h3 className="font-bold text-slate-800">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(p.priority)}`}>
                      {p.priority.toUpperCase()}
                    </span>
                    {p.isDefault && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">Default</span>}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Response Target</span>
                  <span className="text-sm font-bold text-slate-800">{formatTime(p.responseTimeMinutes)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${Math.min(100, (240 / p.responseTimeMinutes) * 100)}%` }}/>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Resolution Target</span>
                  <span className="text-sm font-bold text-slate-800">{formatTime(p.resolutionTimeMinutes)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${Math.min(100, (1440 / p.resolutionTimeMinutes) * 100)}%` }}/>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Operating Hours</span>
                  <span className="text-xs font-semibold text-slate-700">{p.operatingHours === '24_7' ? '24/7 Coverage' : 'Business Hours'}</span>
                </div>
              </div>
            </div>))}
        </div>)}

      {/* Create/Edit Modal */}
      {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600"/> {editingPolicy ? 'Edit SLA Policy' : 'New SLA Policy'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5"/></button>
            </div>
            {formError && (<div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0"/> {formError}
              </div>)}
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Policy Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Critical SLA" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Priority Level *</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Operating Hours</label>
                  <select value={formData.operatingHours} onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="business_hours">Business Hours</option>
                    <option value="24_7">24/7 Coverage</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Response Time (min) *</label>
                  <input type="number" required min={1} value={formData.responseTimeMinutes} onChange={(e) => setFormData({ ...formData, responseTimeMinutes: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Resolution Time (min) *</label>
                  <input type="number" required min={1} value={formData.resolutionTimeMinutes} onChange={(e) => setFormData({ ...formData, resolutionTimeMinutes: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"/>
                <span className="text-sm text-slate-700">Set as default policy for this priority level</span>
              </label>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50">
                  {submitting ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
