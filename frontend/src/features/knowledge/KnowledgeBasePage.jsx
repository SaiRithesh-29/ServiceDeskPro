import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Search, Plus, ThumbsUp, ThumbsDown, ArrowLeft, Tag, Eye, CheckCircle2, Shield, Wifi, Laptop, Key, Printer, Globe, Sparkles, } from 'lucide-react';
import { kbService } from '../../services/kbService';
import { useAuth } from '../../context/AuthContext';
export function KnowledgeBasePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
    const [selectedArticleId, setSelectedArticleId] = useState(searchParams.get('article') || null);
    const [isCreating, setIsCreating] = useState(false);
    const [votedMap, setVotedMap] = useState({});
    const canEdit = ['admin', 'it_manager', 'technician'].includes(user?.role || '');
    // Fetch articles list
    const { data: response, isLoading } = useQuery({
        queryKey: ['kb-articles', { search, category: activeCategory }],
        queryFn: () => kbService.getArticles({
            search: search || undefined,
            category: activeCategory || undefined,
            limit: 50,
        }),
    });
    // Fetch single article when opened
    const { data: articleDetail } = useQuery({
        queryKey: ['kb-article-detail', selectedArticleId],
        queryFn: () => kbService.getArticleById(selectedArticleId),
        enabled: Boolean(selectedArticleId),
    });
    const articles = response?.data || [];
    // Voting mutation
    const voteMutation = useMutation({
        mutationFn: ({ id, isHelpful }) => kbService.voteArticle(id, isHelpful),
        onSuccess: (_data, variables) => {
            setVotedMap((prev) => ({
                ...prev,
                [variables.id]: variables.isHelpful ? 'helpful' : 'unhelpful',
            }));
            queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
            queryClient.invalidateQueries({ queryKey: ['kb-article-detail', selectedArticleId] });
        },
    });
    // Article creation state
    const [newArticle, setNewArticle] = useState({
        title: '',
        category: 'Network',
        problem: '',
        symptoms: '',
        solution: '',
        tags: '',
    });
    const createMutation = useMutation({
        mutationFn: (payload) => kbService.createArticle(payload),
        onSuccess: () => {
            setIsCreating(false);
            queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
            setNewArticle({
                title: '',
                category: 'Network',
                problem: '',
                symptoms: '',
                solution: '',
                tags: '',
            });
        },
    });
    const categories = [
        { name: 'All Categories', icon: Globe, val: '' },
        { name: 'VPN & Remote', icon: Shield, val: 'VPN' },
        { name: 'Network & Wi-Fi', icon: Wifi, val: 'Network' },
        { name: 'Hardware & Devices', icon: Laptop, val: 'Hardware' },
        { name: 'Account & Okta', icon: Key, val: 'Account & Access' },
        { name: 'Printers & AV', icon: Printer, val: 'Printer' },
        { name: 'Security & Phishing', icon: Sparkles, val: 'Security' },
    ];
    // Article Viewer Subview
    if (selectedArticleId && articleDetail) {
        const isVoted = votedMap[articleDetail._id];
        return (<div className="max-w-4xl mx-auto space-y-6 pb-16">
        <button onClick={() => {
                setSelectedArticleId(null);
                setSearchParams({});
            }} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5"/> Back to Knowledge Directory
        </button>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900">
                {articleDetail.articleId}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                {articleDetail.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              {articleDetail.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5"/>
                <span>{articleDetail.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600"/>
                <span>{articleDetail.helpfulVotes} helpful votes</span>
              </div>
              <span>Author: {articleDetail.author?.name || 'IT Staff'}</span>
            </div>
          </div>

          {/* Problem & Symptoms */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Issue / Problem Summary
              </h2>
              <p className="text-sm text-slate-800 leading-relaxed">{articleDetail.problem}</p>
            </div>

            {articleDetail.symptoms && (<div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Symptoms & Diagnostic Indicators
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {articleDetail.symptoms}
                </p>
              </div>)}
          </div>

          {/* Solution Steps */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600"/>
              <span>Step-by-Step Resolution Guide</span>
            </h2>
            <div className="text-sm text-indigo-950 leading-relaxed whitespace-pre-wrap font-sans">
              {articleDetail.solution}
            </div>
          </div>

          {/* Tags */}
          {articleDetail.tags?.length > 0 && (<div className="flex items-center gap-1.5 flex-wrap pt-2">
              <Tag className="w-3.5 h-3.5 text-slate-400"/>
              {articleDetail.tags.map((t) => (<span key={t} className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  #{t}
                </span>))}
            </div>)}

          {/* Helpfulness Voting */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Did this article solve your issue?</p>
              <p className="text-xs text-slate-500">Your feedback helps improve self-service accuracy.</p>
            </div>

            <div className="flex items-center gap-2">
              <button disabled={Boolean(isVoted)} onClick={() => voteMutation.mutate({ id: articleDetail._id, isHelpful: true })} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${isVoted === 'helpful'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'}`}>
                <ThumbsUp className="w-3.5 h-3.5"/>
                <span>Yes, Helpful</span>
              </button>

              <button disabled={Boolean(isVoted)} onClick={() => voteMutation.mutate({ id: articleDetail._id, isHelpful: false })} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${isVoted === 'unhelpful'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700'}`}>
                <ThumbsDown className="w-3.5 h-3.5"/>
                <span>No, Needs Improvement</span>
              </button>
            </div>
          </div>
        </div>
      </div>);
    }
    return (<div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-500"/>
            <span>IT Self-Service Knowledge Base</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified troubleshooting guides, network tutorials, and software procedures.
          </p>
        </div>

        {canEdit && (<button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4"/>
            <span>Publish Article</span>
          </button>)}
      </div>

      {/* Hero Search Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white space-y-4">
        <h2 className="text-xl sm:text-2xl font-black">How can IT support assist you today?</h2>
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search solutions by keyword (e.g. VPN, WiFi, Password, Outlook)..." className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl text-slate-900 text-sm shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300/40"/>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.val;
            return (<button key={cat.name} onClick={() => setActiveCategory(cat.val)} className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${isActive
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm ring-2 ring-amber-400/30 font-bold'
                    : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-medium'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Icon className="w-4 h-4"/>
              </div>
              <span className="text-xs leading-tight">{cat.name}</span>
            </button>);
        })}
      </div>

      {/* Articles Cards Grid */}
      {isLoading ? (<div className="py-16 text-center text-slate-400 text-sm">Loading knowledge articles...</div>) : articles.length === 0 ? (<div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 p-8">
          <BookOpen className="w-10 h-10 mx-auto opacity-30 mb-2"/>
          <p className="font-semibold text-slate-700">No matching articles found</p>
          <p className="text-xs mt-1">Try another keyword or category.</p>
        </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (<div key={art._id} onClick={() => {
                    setSelectedArticleId(art._id);
                    setSearchParams({ article: art._id });
                }} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    {art.articleId}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {art.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {art.problem}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5"/> {art.views}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ThumbsUp className="w-3.5 h-3.5"/> {art.helpfulVotes}
                  </span>
                </div>
                <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                  Read →
                </span>
              </div>
            </div>))}
        </div>)}

      {/* Create Article Modal */}
      {isCreating && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-4 my-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500"/>
              <span>Publish Knowledge Base Article</span>
            </h3>

            <form onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                    ...newArticle,
                    tags: newArticle.tags.split(',').map((t) => t.trim()).filter(Boolean),
                    status: 'published',
                });
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Article Title <span className="text-rose-500">*</span>
                </label>
                <input type="text" value={newArticle.title} onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })} placeholder="e.g. How to connect to Corporate VPN on macOS" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required/>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Category
                </label>
                <select value={newArticle.category} onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <option value="VPN">VPN & Remote Access</option>
                  <option value="Network">Network & Wi-Fi</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Account & Access">Account & Access</option>
                  <option value="Printer">Printer</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Problem Description <span className="text-rose-500">*</span>
                </label>
                <textarea rows={2} value={newArticle.problem} onChange={(e) => setNewArticle({ ...newArticle, problem: e.target.value })} placeholder="Describe the issue or error experienced by users..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" required/>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Symptoms
                </label>
                <textarea rows={2} value={newArticle.symptoms} onChange={(e) => setNewArticle({ ...newArticle, symptoms: e.target.value })} placeholder="Error messages, visual indicators..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"/>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Step-by-Step Resolution / Solution <span className="text-rose-500">*</span>
                </label>
                <textarea rows={5} value={newArticle.solution} onChange={(e) => setNewArticle({ ...newArticle, solution: e.target.value })} placeholder="Numbered steps to resolve..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-xs" required/>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Tags (comma separated)
                </label>
                <input type="text" value={newArticle.tags} onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })} placeholder="vpn, macos, remote, network" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"/>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold disabled:opacity-50">
                  {createMutation.isPending ? 'Publishing...' : 'Publish Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
