import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, ShieldCheck, AlertTriangle, Wrench, History, Ticket, } from 'lucide-react';
import { assetService } from '../../services/assetService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
export function AssetDetailPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [assignLocation, setAssignLocation] = useState('');
    const [notice, setNotice] = useState(null);
    const canManage = ['admin', 'it_manager', 'asset_manager'].includes(user?.role || '');
    // Fetch asset details
    const { data: result, isLoading, isError } = useQuery({
        queryKey: ['asset-detail', id],
        queryFn: () => assetService.getAssetById(id),
    });
    // Fetch users for assignment
    const { data: usersList } = useQuery({
        queryKey: ['all-users-assign'],
        queryFn: () => userService.getUsers({ limit: 100 }),
        enabled: canManage,
    });
    const refreshAsset = () => {
        queryClient.invalidateQueries({ queryKey: ['asset-detail', id] });
        queryClient.invalidateQueries({ queryKey: ['assets-list'] });
    };
    // Status mutation
    const statusMutation = useMutation({
        mutationFn: (newStatus) => assetService.updateStatus(id, newStatus),
        onSuccess: () => {
            setNotice({ type: 'success', message: 'Asset status updated' });
            refreshAsset();
        },
        onError: (err) => {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Status update failed' });
        },
    });
    // Assign mutation
    const assignMutation = useMutation({
        mutationFn: () => assetService.assignAsset(id, selectedUser, undefined, assignLocation),
        onSuccess: () => {
            setNotice({ type: 'success', message: 'Asset assigned successfully' });
            setShowAssignModal(false);
            refreshAsset();
        },
        onError: (err) => {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Assignment failed' });
        },
    });
    // Unassign mutation
    const unassignMutation = useMutation({
        mutationFn: () => assetService.unassignAsset(id, 'Unassigned from asset detail page'),
        onSuccess: () => {
            setNotice({ type: 'success', message: 'Asset returned to stock (available)' });
            refreshAsset();
        },
        onError: (err) => {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Unassignment failed' });
        },
    });
    if (isLoading) {
        return <div className="py-20 text-center text-slate-500 font-medium">Loading asset details...</div>;
    }
    if (isError || !result) {
        return (<div className="max-w-xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3"/>
        <h2 className="text-lg font-bold text-slate-900">Asset Not Found</h2>
        <button onClick={() => navigate('/assets')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
          Return to Assets
        </button>
      </div>);
    }
    const { asset, history = [], relatedTickets = [] } = result;
    const getWarrantyStatus = (expDateStr) => {
        if (!expDateStr)
            return { label: 'Unknown', color: 'text-slate-400 bg-slate-50' };
        const exp = new Date(expDateStr).getTime();
        const now = Date.now();
        const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) {
            return { label: `Expired ${Math.abs(daysLeft)} days ago`, color: 'text-rose-700 bg-rose-50 border-rose-200' };
        }
        if (daysLeft <= 90) {
            return { label: `Expires soon in ${daysLeft} days`, color: 'text-amber-700 bg-amber-50 border-amber-200 font-bold' };
        }
        return { label: `Active & Valid (${daysLeft} days remaining)`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    };
    const warranty = getWarrantyStatus(asset.warrantyExpiration);
    return (<div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb */}
      <div>
        <button onClick={() => navigate('/assets')} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5"/> Back to Asset Registry
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
              {asset.assetId}
            </span>
            <h1 className="text-2xl font-black text-slate-900">{asset.name}</h1>
          </div>

          {/* Action lifecycle buttons */}
          {canManage && (<div className="flex flex-wrap items-center gap-2">
              {asset.status === 'available' && (<button onClick={() => setShowAssignModal(true)} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5"/>
                  <span>Assign to User</span>
                </button>)}

              {asset.status === 'assigned' && (<button onClick={() => unassignMutation.mutate()} className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
                  Unassign (Return to Stock)
                </button>)}

              {asset.status !== 'under_repair' && (<button onClick={() => statusMutation.mutate('under_repair')} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-500"/>
                  <span>Mark Under Repair</span>
                </button>)}

              {asset.status === 'under_repair' && (<button onClick={() => statusMutation.mutate('available')} className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs">
                  Repair Complete (Available)
                </button>)}
            </div>)}
        </div>
      </div>

      {notice && (<div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)} className="font-bold">✕</button>
        </div>)}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Properties & Specs */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Asset Properties
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Type:</span>
                <span className="font-bold text-slate-800">{asset.type}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Manufacturer:</span>
                <span className="font-semibold text-slate-800">{asset.manufacturer}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Model:</span>
                <span className="font-semibold text-slate-800">{asset.model}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Serial Number:</span>
                <span className="font-mono font-bold text-slate-800">{asset.serialNumber}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold capitalize text-slate-800">{asset.status.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Current Custody:</span>
                <span className="font-bold text-slate-900">
                  {asset.assignedUser?.name || <span className="text-slate-400">Unassigned</span>}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-700">{asset.location || 'Main Office'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Purchase Date:</span>
                <span className="text-slate-700">
                  {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Cost:</span>
                <span className="font-bold text-slate-900">
                  ${asset.purchaseCost?.toLocaleString() || 0} USD
                </span>
              </div>
            </div>
          </div>

          {/* Warranty Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600"/>
              <span>Warranty Coverage</span>
            </h2>
            <div className={`p-3 rounded-xl border text-xs ${warranty.color}`}>
              <p className="font-bold">{warranty.label}</p>
              <p className="text-[11px] mt-0.5 opacity-80">
                Expiration: {asset.warrantyExpiration ? new Date(asset.warrantyExpiration).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: History & Linked Tickets (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lifecycle Audit History */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600"/>
              <span>Custody & Lifecycle History</span>
            </h2>

            {history.length === 0 ? (<p className="text-xs text-slate-400 py-4 text-center">No lifecycle history logged yet.</p>) : (<div className="space-y-3">
                {history.map((h) => (<div key={h._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{h.action}</span>
                      <span className="text-slate-400">
                        {new Date(h.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{h.details}</p>
                    {h.performedBy && (<p className="text-[11px] text-slate-400">
                        Logged by: {h.performedBy.name}
                      </p>)}
                  </div>))}
              </div>)}
          </div>

          {/* Linked Support Tickets */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-500"/>
              <span>Related Service Tickets ({relatedTickets.length})</span>
            </h2>

            {relatedTickets.length === 0 ? (<p className="text-xs text-slate-400 py-4 text-center">
                No tickets currently associated with this device.
              </p>) : (<div className="space-y-2">
                {relatedTickets.map((t) => (<div key={t._id} onClick={() => navigate(`/tickets/${t.ticketId}`)} className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between transition-all">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600 mr-2">
                        {t.ticketId}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{t.title}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>))}
              </div>)}
          </div>
        </div>
      </div>

      {/* Assign User Modal */}
      {showAssignModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600"/>
              <span>Assign Asset Custody</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Assign to Employee
                </label>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <option value="">-- Choose Employee / User --</option>
                  {usersList?.data?.map((u) => (<option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Physical Office Location
                </label>
                <input type="text" value={assignLocation} onChange={(e) => setAssignLocation(e.target.value)} placeholder="e.g. San Francisco HQ - Desk 4B" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"/>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button onClick={() => assignMutation.mutate()} disabled={!selectedUser || assignMutation.isPending} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50">
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>)}
    </div>);
}
