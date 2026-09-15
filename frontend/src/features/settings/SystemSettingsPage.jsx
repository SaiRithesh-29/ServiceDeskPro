import { useState, useEffect } from 'react';
import { Settings, RefreshCw, Save, Clock, Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';
import { settingService } from '../../services/settingService';
export function SystemSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState('');
    const [businessHours, setBusinessHours] = useState({
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5],
        timezone: 'Asia/Kolkata',
    });
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const bh = await settingService.getBusinessHours();
            if (bh) {
                setBusinessHours({
                    start: bh.start || '09:00',
                    end: bh.end || '17:00',
                    days: bh.days || [1, 2, 3, 4, 5],
                    timezone: bh.timezone || 'Asia/Kolkata',
                });
            }
        }
        catch (err) {
            console.error('Failed to load settings:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchSettings(); }, []);
    const handleSaveBusinessHours = async () => {
        setSaving(true);
        setError('');
        setSuccessMsg('');
        try {
            await settingService.updateBusinessHours(businessHours);
            setSuccessMsg('Business hours saved successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to save settings');
        }
        finally {
            setSaving(false);
        }
    };
    const toggleDay = (day) => {
        setBusinessHours((prev) => ({
            ...prev,
            days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day].sort(),
        }));
    };
    if (loading) {
        return (<div className="flex items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-3 text-indigo-500"/> Loading system settings...
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-indigo-600"/> System Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Global platform configuration for business hours, SLA engine, and integrations.</p>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMsg && (<div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0"/> {successMsg}
        </div>)}
      {error && (<div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0"/> {error}
        </div>)}

      {/* Business Hours Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600"/> Business Hours
        </h2>
        <p className="text-sm text-slate-500 mb-6">Configure when SLA timers count towards response and resolution deadlines.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start / End Time */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Start Time</label>
              <input type="time" value={businessHours.start} onChange={(e) => setBusinessHours({ ...businessHours, start: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">End Time</label>
              <input type="time" value={businessHours.end} onChange={(e) => setBusinessHours({ ...businessHours, end: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Timezone</label>
              <select value={businessHours.timezone} onChange={(e) => setBusinessHours({ ...businessHours, timezone: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Working Days</label>
            <div className="grid grid-cols-7 gap-2">
              {dayLabels.map((label, i) => (<button key={i} onClick={() => toggleDay(i)} className={`py-3 rounded-xl text-sm font-semibold transition-all ${businessHours.days.includes(i)
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {label}
                </button>))}
            </div>
            <p className="text-xs text-slate-400 mt-3">Click to toggle working days. SLA timers only count during selected business days and hours.</p>

            {/* Preview */}
            <div className="mt-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">Schedule Preview</p>
              <p className="text-sm text-indigo-900 font-medium">
                {businessHours.start} — {businessHours.end} ({businessHours.timezone})
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                {businessHours.days.map((d) => dayLabels[d]).join(', ')}
              </p>
              <p className="text-xs text-indigo-500 mt-1">
                {(() => {
            const [sh, sm] = businessHours.start.split(':').map(Number);
            const [eh, em] = businessHours.end.split(':').map(Number);
            const hoursPerDay = (eh * 60 + em - sh * 60 - sm) / 60;
            return `${hoursPerDay.toFixed(1)} hours/day × ${businessHours.days.length} days = ${(hoursPerDay * businessHours.days.length).toFixed(1)} hours/week`;
        })()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-6 pt-4 border-t border-slate-100">
          <button onClick={handleSaveBusinessHours} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50">
            <Save className="w-4 h-4"/> {saving ? 'Saving...' : 'Save Business Hours'}
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-slate-500"/> System Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Platform</p>
            <p className="text-sm font-bold text-slate-800 mt-1">ServiceDesk Pro</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Version</p>
            <p className="text-sm font-bold text-slate-800 mt-1">1.0.0</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Stack</p>
            <p className="text-sm font-bold text-slate-800 mt-1">MERN + TypeScript</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">AI Engine</p>
            <p className="text-sm font-bold text-slate-800 mt-1">Semantic Classifier</p>
          </div>
        </div>
      </div>
    </div>);
}
