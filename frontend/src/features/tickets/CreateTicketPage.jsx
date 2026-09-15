import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Sparkles, Wand2, CheckCircle2, Upload, BookOpen, } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { aiService } from '../../services/aiService';
import { assetService } from '../../services/assetService';
import apiClient from '../../services/apiClient';
export function CreateTicketPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Hardware',
        priority: 'medium',
        asset: '',
    });
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [appliedAi, setAppliedAi] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [error, setError] = useState('');
    // Load user's assigned assets if any
    const { data: userAssets } = useQuery({
        queryKey: ['my-assets'],
        queryFn: () => assetService.getAssets({ limit: 10 }),
    });
    // Debounced AI classification trigger
    useEffect(() => {
        if (!formData.title || formData.title.length < 5) {
            setAiResult(null);
            return;
        }
        const timer = setTimeout(async () => {
            setAiLoading(true);
            try {
                const res = await aiService.classifyTicket(formData.title, formData.description || formData.title);
                setAiResult(res);
            }
            catch (err) {
                console.error('AI classification failed:', err);
            }
            finally {
                setAiLoading(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.title, formData.description]);
    const applyAI = () => {
        if (!aiResult)
            return;
        setFormData((prev) => ({
            ...prev,
            category: aiResult.classification.category,
            priority: aiResult.classification.priority,
        }));
        setAppliedAi(true);
    };
    const createMutation = useMutation({
        mutationFn: async (payload) => {
            return await ticketService.createTicket(payload);
        },
        onSuccess: (data) => {
            navigate(`/tickets/${data.ticketId}`);
        },
        onError: (err) => {
            setError(err.response?.data?.message || 'Failed to submit ticket');
        },
    });
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setSelectedFile(file);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        try {
            const res = await apiClient.post('/uploads', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadedUrl(res.data.data.url);
        }
        catch (err) {
            setError('File upload failed: ' + (err.response?.data?.message || err.message));
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim()) {
            setError('Please provide both a title and description.');
            return;
        }
        createMutation.mutate({
            ...formData,
            asset: formData.asset || undefined,
        });
    };
    return (<div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <span>Create New Support Ticket</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600"/>
            AI Auto-Triage
          </span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Describe the IT issue you are facing. Our automated intelligence will route it to the right specialist team and suggest instant fixes.
        </p>
      </div>

      {error && (<div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold ml-2">✕</button>
        </div>)}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Issue Summary / Title <span className="text-rose-500">*</span>
              </label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Cannot connect to GlobalProtect VPN from home network" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" required/>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Detailed Description & Error Messages <span className="text-rose-500">*</span>
              </label>
              <textarea rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What were you doing when the issue occurred? Include any error codes or steps you have already tried..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" required/>
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Category
                </label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white">
                  <option value="Hardware">Hardware (Laptops, Desktops, Screens)</option>
                  <option value="Software">Software (Office, IDEs, Licensing)</option>
                  <option value="Network">Network & Wi-Fi</option>
                  <option value="VPN">VPN & Remote Access</option>
                  <option value="Account & Access">Account, Okta & Passwords</option>
                  <option value="Email">Email & Messaging</option>
                  <option value="Printer">Office Printers & Scanners</option>
                  <option value="Security">Security & Suspicious Activity</option>
                  <option value="Application">Enterprise Applications</option>
                  <option value="Other">Other Requests</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Urgency / Priority
                </label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white">
                  <option value="low">Low - Minor question / non-blocking</option>
                  <option value="medium">Medium - Normal workflow affected</option>
                  <option value="high">High - Important deadline or multi-user impact</option>
                  <option value="critical">Critical - Complete outage / Security breach</option>
                </select>
              </div>
            </div>

            {/* Linked Asset */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Related Workstation or Asset (Optional)
              </label>
              <select value={formData.asset} onChange={(e) => setFormData({ ...formData, asset: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white">
                <option value="">-- Select an assigned asset if applicable --</option>
                {userAssets?.data?.map((ast) => (<option key={ast._id} value={ast._id}>
                    {ast.assetId} - {ast.name} ({ast.serialNumber})
                  </option>))}
              </select>
            </div>

            {/* File Attachment Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Attachments & Screenshots
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
                <input type="file" id="ticket-file-input" onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.log,.zip"/>
                <label htmlFor="ticket-file-input" className="cursor-pointer flex flex-col items-center gap-1.5">
                  <Upload className="w-5 h-5 text-indigo-600"/>
                  <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    Click to attach file or screenshot
                  </span>
                  <span className="text-[11px] text-slate-400">
                    PNG, JPG, PDF, TXT, LOG up to 10MB
                  </span>
                </label>
                {selectedFile && (<div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 py-1 px-3 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600"/>
                    <span>Attached: {selectedFile.name}</span>
                  </div>)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button type="button" onClick={() => navigate('/tickets')} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={createMutation.isPending} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                {createMutation.isPending ? 'Submitting Ticket...' : 'Submit Support Ticket'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: AI Live Insights & Suggestions (1 col) */}
        <div className="space-y-6">
          {/* AI Live Classifier Box */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-800/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse"/>
                <span>AI Classification Assistant</span>
              </div>
              {aiLoading && (<span className="text-[11px] text-indigo-300 bg-indigo-800/50 px-2 py-0.5 rounded-full animate-pulse">
                  Analyzing issue...
                </span>)}
            </div>

            {aiResult ? (<div className="space-y-4 text-sm animate-in fade-in duration-200">
                <div>
                  <p className="text-xs text-indigo-300 font-medium">Detected Issue:</p>
                  <p className="font-bold text-white text-base mt-0.5">
                    {aiResult.classification.keyIssue}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <span className="text-indigo-300 block">Suggested Category:</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">
                      {aiResult.classification.category}
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <span className="text-indigo-300 block">Predicted Urgency:</span>
                    <span className="font-bold text-white text-sm mt-0.5 block capitalize">
                      {aiResult.classification.priority}
                    </span>
                  </div>
                </div>

                {/* Apply button */}
                <button type="button" onClick={applyAI} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                  <Wand2 className="w-3.5 h-3.5"/>
                  <span>{appliedAi ? '✓ Auto-Categorization Applied' : 'Auto-Fill Category & Priority'}</span>
                </button>

                {/* Suggested Steps */}
                {aiResult.classification.suggestedSteps?.length > 0 && (<div className="pt-2 border-t border-white/10 space-y-1.5">
                    <p className="text-xs font-semibold text-indigo-200">Recommended Troubleshooting Steps:</p>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {aiResult.classification.suggestedSteps.map((step, idx) => (<li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{step}</span>
                        </li>))}
                    </ul>
                  </div>)}
              </div>) : (<div className="text-center py-6 text-indigo-200/60 space-y-2">
                <Wand2 className="w-8 h-8 mx-auto opacity-40"/>
                <p className="text-xs">Type your issue summary on the left to activate instant AI triage & solutions.</p>
              </div>)}
          </div>

          {/* Suggested Knowledge Base Solutions */}
          {aiResult && aiResult.suggestedArticles?.length > 0 && (<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <BookOpen className="w-4 h-4 text-amber-500"/>
                <span>Related Knowledge Base Articles</span>
              </div>
              <div className="space-y-2">
                {aiResult.suggestedArticles.map((art) => (<div key={art._id} onClick={() => navigate(`/knowledge-base?article=${art._id}`)} className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition-all group">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                      {art.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{art.problem}</p>
                  </div>))}
              </div>
            </div>)}
        </div>
      </div>
    </div>);
}
