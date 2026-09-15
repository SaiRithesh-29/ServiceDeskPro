import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HardDrive, Plus, Search, Download, User, } from 'lucide-react';
import { assetService } from '../../services/assetService';
import { reportService } from '../../services/reportService';
export function AssetListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [status, setStatus] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [notice, setNotice] = useState(null);
    // New Asset Form State
    const [newAsset, setNewAsset] = useState({
        name: '',
        type: 'Laptop',
        serialNumber: '',
        manufacturer: '',
        model: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseCost: 0,
        warrantyExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'Main Office',
        vendor: '',
        status: 'available',
    });
    const { data: response, isLoading } = useQuery({
        queryKey: ['assets-list', { search, type, status }],
        queryFn: () => assetService.getAssets({ search, type, status, limit: 100 }),
    });
    const assets = response?.data || [];
    const createMutation = useMutation({
        mutationFn: (data) => assetService.createAsset(data),
        onSuccess: () => {
            setNotice({ type: 'success', message: 'Asset registered successfully' });
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['assets-list'] });
            setNewAsset({
                name: '',
                type: 'Laptop',
                serialNumber: '',
                manufacturer: '',
                model: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                purchaseCost: 0,
                warrantyExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                location: 'Main Office',
                vendor: '',
                status: 'available',
            });
        },
        onError: (err) => {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Failed to register asset' });
        },
    });
    const getStatusBadge = (s) => {
        switch (s) {
            case 'available':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'assigned':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'under_repair':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'retired':
                return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'lost':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };
    const getWarrantyStatus = (expDateStr) => {
        if (!expDateStr)
            return { label: 'Unknown', color: 'text-slate-400 bg-slate-50' };
        const exp = new Date(expDateStr).getTime();
        const now = Date.now();
        const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) {
            return { label: `Expired ${Math.abs(daysLeft)}d ago`, color: 'text-rose-700 bg-rose-50 border-rose-200' };
        }
        if (daysLeft <= 90) {
            return { label: `Expires in ${daysLeft}d`, color: 'text-amber-700 bg-amber-50 border-amber-200 font-bold' };
        }
        return { label: `Valid (${daysLeft}d left)`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    };
    // Metrics summary
    const totalCount = assets.length;
    const availableCount = assets.filter((a) => a.status === 'available').length;
    const assignedCount = assets.filter((a) => a.status === 'assigned').length;
    const repairCount = assets.filter((a) => a.status === 'under_repair').length;
    return (<div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <HardDrive className="w-6 h-6 text-emerald-600"/>
            <span>IT Asset & Hardware Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track workstation assignments, warranty lifecycles, and software licenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href={reportService.getExportUrl('assets')} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors">
            <Download className="w-4 h-4 text-slate-500"/>
            <span>Export Asset CSV</span>
          </a>

          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4"/>
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {notice && (<div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)} className="font-bold">✕</button>
        </div>)}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Total Assets</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">In Stock / Available</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{availableCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Assigned</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{assignedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Under Repair</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{repairCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by asset ID, name, serial number..." className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"/>
        </div>

        <div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Hardware & Software Types</option>
            <option value="Laptop">Laptops</option>
            <option value="Desktop">Desktops</option>
            <option value="Monitor">Monitors</option>
            <option value="Server">Servers</option>
            <option value="Router">Routers & Switches</option>
            <option value="Printer">Printers</option>
            <option value="Software License">Software Licenses</option>
            <option value="Mobile">Mobile Phones</option>
            <option value="Other">Other Peripherals</option>
          </select>
        </div>

        <div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Statuses</option>
            <option value="available">Available / In Stock</option>
            <option value="assigned">Assigned to User</option>
            <option value="under_repair">Under Repair</option>
            <option value="retired">Retired / Decommissioned</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (<div className="py-16 text-center text-slate-400 text-sm">Loading asset registry...</div>) : assets.length === 0 ? (<div className="py-16 text-center text-slate-400 space-y-2">
            <HardDrive className="w-10 h-10 mx-auto opacity-30"/>
            <p className="font-semibold text-slate-700">No assets found</p>
            <p className="text-xs">Adjust your search or register new hardware.</p>
          </div>) : (<div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Device Name & Model</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Custody</th>
                  <th className="py-3 px-4">Warranty</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((ast) => {
                const warranty = getWarrantyStatus(ast.warrantyExpiration);
                return (<tr key={ast._id} onClick={() => navigate(`/assets/${ast._id}`)} className="hover:bg-slate-50/80 cursor-pointer transition-colors group">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-700">
                        {ast.assetId}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {ast.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {ast.manufacturer} • {ast.model}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        {ast.type}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {ast.serialNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${getStatusBadge(ast.status)}`}>
                          {ast.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {ast.assignedUser?.name ? (<div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400"/>
                            <span>{ast.assignedUser.name}</span>
                          </div>) : (<span className="text-slate-400">Unassigned</span>)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${warranty.color}`}>
                          {warranty.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assets/${ast._id}`);
                    }} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white rounded-lg transition-all">
                          Inspect
                        </button>
                      </td>
                    </tr>);
            })}
              </tbody>
            </table>
          </div>)}
      </div>

      {/* Create Asset Modal */}
      {showCreateModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 my-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-600"/>
              <span>Register New IT Asset</span>
            </h3>

            <form onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(newAsset);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Device Name / Title <span className="text-rose-500">*</span>
                </label>
                <input type="text" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} placeholder="e.g. MacBook Pro 16 M3 Max" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Asset Type <span className="text-rose-500">*</span>
                  </label>
                  <select value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Server">Server</option>
                    <option value="Router">Router / Switch</option>
                    <option value="Printer">Printer</option>
                    <option value="Software License">Software License</option>
                    <option value="Mobile">Mobile Device</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Serial Number <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" value={newAsset.serialNumber} onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })} placeholder="e.g. C02XYZ982741" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Manufacturer
                  </label>
                  <input type="text" value={newAsset.manufacturer} onChange={(e) => setNewAsset({ ...newAsset, manufacturer: e.target.value })} placeholder="e.g. Apple / Dell / Cisco" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required/>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Model
                  </label>
                  <input type="text" value={newAsset.model} onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })} placeholder="e.g. Precision 5570" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Purchase Date
                  </label>
                  <input type="date" value={newAsset.purchaseDate} onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"/>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Warranty Expiration Date <span className="text-rose-500">*</span>
                  </label>
                  <input type="date" value={newAsset.warrantyExpiration} onChange={(e) => setNewAsset({ ...newAsset, warrantyExpiration: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Cost ($ USD)
                  </label>
                  <input type="number" value={newAsset.purchaseCost} onChange={(e) => setNewAsset({ ...newAsset, purchaseCost: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"/>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Vendor
                  </label>
                  <input type="text" value={newAsset.vendor} onChange={(e) => setNewAsset({ ...newAsset, vendor: e.target.value })} placeholder="e.g. CDW / Dell Direct" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"/>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50">
                  {createMutation.isPending ? 'Saving...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
