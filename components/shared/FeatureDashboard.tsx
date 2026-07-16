import React, { useState } from "react";
import { BookOpen, BarChart2, FileText, Send, StickyNote, Plus, Search, Trash2, X, Sparkles, Heart, ClipboardList, Book } from "lucide-react";
import { createStudyResource } from "../../lib/data_helpers";

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function FeatureDashboard({ tabs, mode = 'view', teacherId }: { tabs: TabItem[], mode?: 'management' | 'view', teacherId?: string }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'lessons');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Mock data representing the "Study Kit" resources
  const [resources, setResources] = useState([
    { id: '1', type: 'lessons', title: 'Intro to Photosynthesis', status: 'Deployed', date: '2023-10-25' },
    { id: '2', type: 'exams', title: 'Mid-term Quiz: Plant Biology', status: 'Draft', date: '2023-10-26' },
    { id: '3', type: 'guides', title: 'Cellular Respiration Flow', status: 'Deployed', date: '2023-10-24' },
    { id: '4', type: 'notes', title: 'Chapter 4 Key Terms', status: 'Archived', date: '2023-10-20' },
  ]);

  const handleCreate = async () => {
    if (!newTitle) return;
    const newResource = {
      id: Math.random().toString(36).substr(2, 9),
      type: activeTab,
      title: newTitle,
      status: 'Deployed',
      date: new Date().toISOString().split('T')[0]
    };
    
    setResources([newResource, ...resources]);
    setNewTitle('');
    setIsCreating(false);
    
    if (teacherId) {
      await createStudyResource({
        title: newTitle,
        type: activeTab,
        status: 'Deployed',
        teacher_id: teacherId
      });
    }
  };

  const filteredResources = resources.filter(r => 
    r.type === activeTab && 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header for Management */}
      {mode === 'management' && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-white">Study Kit Library</h2>
            <p className="text-slate-400 mt-1 text-sm">Design and deploy learning resources to your student network.</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Module
          </button>
        </div>
      )}

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0f1d] border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Create New {activeTab.slice(0, -1)}</h3>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Module Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Advanced Photosynthesis"
                  className="w-full bg-[#060a12] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white"
                />
              </div>
              <button 
                onClick={handleCreate}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                Deploy to Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Resource List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <div 
              key={resource.id} 
              className="flex items-center justify-between p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${
                  resource.type === 'exams' ? 'bg-rose-500/10 text-rose-400' :
                  resource.type === 'guides' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {resource.type === 'exams' ? <ClipboardList className="w-5 h-5" /> :
                   resource.type === 'guides' ? <Book className="w-5 h-5" /> :
                   <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">{resource.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      {resource.date}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      resource.status === 'Deployed' ? 'bg-emerald-500/10 text-emerald-400' :
                      resource.status === 'Draft' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {resource.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                {mode === 'management' && (
                  <>
                    <button 
                      onClick={() => alert(`Optimizing "${resource.title}" using AI... Module structure improved and clarity enhanced.`)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold uppercase transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      Optimize
                    </button>
                    <button 
                      onClick={() => alert(`Shared "${resource.title}" with all students successfully!`)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold uppercase transition-all"
                    >
                      <Send className="w-3 h-3" />
                      Deploy
                    </button>
                  </>
                )}
                {mode === 'view' && (
                  <button 
                    onClick={() => alert(`Recommended "${resource.title}" to your student. They will see it in their priority list.`)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[10px] font-bold uppercase transition-all"
                  >
                    <Heart className="w-3 h-3" />
                    Recommend
                  </button>
                )}
                <button 
                  onClick={() => alert(`Viewing Notes/Metadata for: "${resource.title}"\nStatus: ${resource.status}\nCreated: ${resource.date}`)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <StickyNote className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setResources(resources.filter(r => r.id !== resource.id));
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No {activeTab} found</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="mt-4 text-indigo-400 text-sm font-bold hover:text-indigo-300"
            >
              Create your first {activeTab.slice(0, -1)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
