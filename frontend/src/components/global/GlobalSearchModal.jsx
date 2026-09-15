import React, { useState, useEffect, useRef } from 'react';
import { Search, Ticket, Box, BookOpen, User, X, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/searchService';
export function GlobalSearchModal({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({
        tickets: [],
        articles: [],
        assets: [],
        users: [],
    });
    const inputRef = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
        else {
            setQuery('');
            setResults({ tickets: [], articles: [], assets: [], users: [] });
        }
    }, [isOpen]);
    useEffect(() => {
        if (!query || query.trim().length < 2) {
            setResults({ tickets: [], articles: [], assets: [], users: [] });
            setLoading(false);
            return;
        }
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await searchService.globalSearch(query.trim());
                setResults(res);
            }
            catch (err) {
                console.error('Search failed:', err);
            }
            finally {
                setLoading(false);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [query]);
    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const totalResults = results.tickets.length +
        results.articles.length +
        results.assets.length +
        results.users.length;
    const handleSelect = (path) => {
        navigate(path);
        onClose();
    };
    return (<div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0"/>
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tickets, assets, KB articles, users... (e.g. SDP-1001, MacBook, VPN)" className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-base focus:outline-none"/>
          {loading && <Loader2 className="w-5 h-5 text-slate-400 animate-spin"/>}
          {query && !loading && (<button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
              <X className="w-4 h-4"/>
            </button>)}
          <button onClick={onClose} className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200 hover:bg-slate-200">
            ESC
          </button>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {query.trim().length >= 2 && totalResults === 0 && !loading && (<div className="text-center py-10 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40"/>
              <p className="font-medium text-slate-600">No results found for "{query}"</p>
              <p className="text-sm">Try searching by ticket ID, device model, or keyword</p>
            </div>)}

          {/* Tickets Results */}
          {results.tickets.length > 0 && (<div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                <Ticket className="w-3.5 h-3.5 text-indigo-500"/>
                <span>Tickets ({results.tickets.length})</span>
              </div>
              <div className="space-y-1">
                {results.tickets.map((t) => (<button key={t._id} onClick={() => handleSelect(`/tickets/${t.ticketId}`)} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/70 text-left transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        {t.ticketId}
                      </span>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900 truncate max-w-md">
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                        {t.status.replace('_', ' ')}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5"/>
                    </div>
                  </button>))}
              </div>
            </div>)}

          {/* Knowledge Base Articles */}
          {results.articles.length > 0 && (<div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-500"/>
                <span>Knowledge Base ({results.articles.length})</span>
              </div>
              <div className="space-y-1">
                {results.articles.map((a) => (<button key={a._id} onClick={() => handleSelect(`/knowledge-base?article=${a._id}`)} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/70 text-left transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {a.articleId}
                      </span>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-amber-900 truncate max-w-md">
                        {a.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{a.helpfulVotes} helpful votes</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600"/>
                    </div>
                  </button>))}
              </div>
            </div>)}

          {/* Assets */}
          {results.assets.length > 0 && (<div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                <Box className="w-3.5 h-3.5 text-emerald-500"/>
                <span>Hardware & Software Assets ({results.assets.length})</span>
              </div>
              <div className="space-y-1">
                {results.assets.map((ast) => (<button key={ast._id} onClick={() => handleSelect(`/assets/${ast._id}`)} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 text-left transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {ast.assetId}
                      </span>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-900 truncate max-w-md">
                        {ast.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {ast.type}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600"/>
                    </div>
                  </button>))}
              </div>
            </div>)}

          {/* Users */}
          {results.users.length > 0 && (<div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                <User className="w-3.5 h-3.5 text-blue-500"/>
                <span>Users ({results.users.length})</span>
              </div>
              <div className="space-y-1">
                {results.users.map((u) => (<button key={u._id} onClick={() => handleSelect(`/users`)} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 text-left transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-700 block">{u.name}</span>
                        <span className="text-xs text-slate-400">{u.email}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium capitalize">
                      {u.role.replace('_', ' ')}
                    </span>
                  </button>))}
              </div>
            </div>)}

          {!query && (<div className="py-8 px-4 text-center">
              <p className="text-sm font-medium text-slate-500 mb-2">Quick Navigation Shortcuts</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => handleSelect('/tickets/create')} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700">
                  + New Ticket
                </button>
                <button onClick={() => handleSelect('/tickets')} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700">
                  Browse Tickets
                </button>
                <button onClick={() => handleSelect('/knowledge-base')} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700">
                  Knowledge Base
                </button>
                <button onClick={() => handleSelect('/assets')} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700">
                  Asset Inventory
                </button>
              </div>
            </div>)}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↵</kbd>
            <span>select</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">esc</kbd>
            <span>close</span>
          </div>
          <div>ServiceDesk Pro Spotlight</div>
        </div>
      </div>
    </div>);
}
