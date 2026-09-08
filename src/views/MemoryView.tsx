import React, { useState } from 'react';
import {
  Brain,
  Search,
  Plus,
  Star,
  Trash2,
  Download,
  AlertTriangle,
  Sparkles,
  Tag,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { MemoryItem, MemoryCategory, ImportanceLevel } from '../types';
import { api } from '../lib/api';

interface Props {
  memories: MemoryItem[];
  onRefreshData: () => void;
}

export const MemoryView: React.FC<Props> = ({ memories, onRefreshData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // New Memory Input
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('Academic');
  const [newImportance, setNewImportance] = useState<ImportanceLevel>('high');
  const [saving, setSaving] = useState(false);

  // Forget query modal
  const [showForgetModal, setShowForgetModal] = useState(false);
  const [forgetTopic, setForgetTopic] = useState('');
  const [forgetMessage, setForgetMessage] = useState('');

  const categories: string[] = [
    'All',
    'Academic',
    'Personal',
    'Career',
    'Projects',
    'Goals',
    'Preferences'
  ];

  const filteredMemories = memories.filter((m) => {
    const matchesCategory =
      selectedCategory === 'All' || m.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      await api.createMemory({
        content: newContent.trim(),
        category: newCategory,
        importance: newImportance,
        isStarred: newImportance === 'high'
      });
      setNewContent('');
      onRefreshData();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStar = async (memory: MemoryItem) => {
    await api.updateMemory(memory.id, { isStarred: !memory.isStarred });
    onRefreshData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this memory item from Athena second brain?')) {
      await api.deleteMemory(id);
      onRefreshData();
    }
  };

  const handleForgetTopic = async () => {
    if (!forgetTopic.trim()) return;
    const res = await api.forgetMemory(forgetTopic.trim());
    setForgetMessage(res.message);
    setForgetTopic('');
    onRefreshData();
    setTimeout(() => {
      setForgetMessage('');
      setShowForgetModal(false);
    }, 2500);
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Long-Term Memory Bank</h2>
          <p className="text-xs text-slate-400">Context, learning styles, goals, and habits Athena remembers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForgetModal(true)}
            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
          >
            Forget Topic
          </button>
          <a
            href="/api/export"
            download="athena_second_brain.json"
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Download full JSON memory export"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Explicit Memory Input Box */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <form onSubmit={handleAddMemory} className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Context in Second Brain</span>
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="e.g., I find dynamic programming state transitions challenging; I prefer deep study sessions from 6 PM to 10 PM..."
            rows={2}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-medium"
              >
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={newImportance}
                onChange={(e) => setNewImportance(e.target.value as ImportanceLevel)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-medium"
              >
                <option value="high">High Importance</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!newContent.trim() || saving}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold hover:bg-sky-400 active:scale-95 disabled:opacity-40 transition-all"
            >
              {saving ? 'Remembering...' : 'Remember Context'}
            </button>
          </div>
        </form>
      </div>

      {/* Search & Category filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search remembered facts, study styles, goals..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards */}
      <div className="space-y-2.5">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No memories matched your search. You can add items above or tell Athena in Chat.
          </div>
        ) : (
          filteredMemories.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                item.isStarred
                  ? 'bg-slate-900/90 border-amber-500/30 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.category === 'Academic'
                        ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                        : item.category === 'Preferences'
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                        : item.category === 'Career'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.category}
                  </span>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.importance} priority
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStar(item)}
                    className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                      item.isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={item.isStarred ? 'Unstar memory' : 'Star memory'}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-600 hover:text-rose-400 transition-colors"
                    title="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
                "{item.content}"
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Source: {item.source.replace(/_/g, ' ')}</span>
                <span>{item.createdDate.split('T')[0]}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Forget Topic Modal */}
      {showForgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                Forget Memory Context
              </h3>
              <button onClick={() => setShowForgetModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Type a subject, keyword, or topic you want Athena to completely purge from long-term memory.
            </p>

            <input
              type="text"
              value={forgetTopic}
              onChange={(e) => setForgetTopic(e.target.value)}
              placeholder="e.g. dynamic programming, exam date..."
              className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white mb-3"
            />

            {forgetMessage && (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs mb-3">
                {forgetMessage}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowForgetModal(false)}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleForgetTopic}
                className="flex-1 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-400"
              >
                Forget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
