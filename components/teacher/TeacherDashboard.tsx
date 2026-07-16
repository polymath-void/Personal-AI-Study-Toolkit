import React, { useState, useEffect } from 'react';
import { Profile, StudentWithStats } from '../../types';
import { LogoutButton } from '../shared/LogoutButton';
import FeatureDashboard from '../shared/FeatureDashboard';
import StudentMonitor from '../shared/StudentMonitor';
import { MessageCenter } from '../shared/MessageCenter';
import { getAllStudentsForTeacher } from '../../lib/data_helpers';
import { Users, BookOpen, Layout, ClipboardList, Book, MessageSquare, Award, Plus, Menu, X, Sparkles, Brain } from 'lucide-react';

export default function TeacherDashboard({ profile }: { profile: Profile }): JSX.Element {
  const [activeView, setActiveView] = useState<'overview' | 'monitor' | 'messages' | 'achievements'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [students, setStudents] = useState<StudentWithStats[]>([]);

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = async () => {
    const data = await getAllStudentsForTeacher();
    setStudents(data);
  };

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        body: JSON.stringify({
          action: 'insights',
          role: 'teacher',
          data: { studentCount: students.length, studentStats: students.map(s => s.stats) }
        })
      });
      const data = await response.json();
      setAiInsights(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const teacherTabs = [
    { id: 'lessons', label: 'Lessons', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'workflow', label: 'Workflow', icon: <Layout className="w-4 h-4" /> },
    { id: 'exams', label: 'Exams', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'guides', label: 'Guides', icon: <Book className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <ClipboardList className="w-4 h-4" /> },
  ];

  const getActiveStyles = (color: string) => {
    switch (color) {
      case "indigo":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "emerald":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "amber":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const NavButton = ({ id, label, icon: Icon, color }: { id: typeof activeView, label: string, icon: any, color: string }) => (
    <button 
      onClick={() => {
        setActiveView(id);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeView === id 
          ? getActiveStyles(color) 
          : 'text-slate-400 hover:bg-slate-800/50 border border-transparent'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#060a12] text-white flex flex-col">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0a0f1d] shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 md:hidden hover:bg-slate-800 rounded-lg text-slate-400"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">
              {profile.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-none">Teacher Console</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{profile.name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={generateInsights}
            disabled={loadingInsights}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className={`w-3 h-3 ${loadingInsights ? 'animate-spin' : ''}`} />
            {loadingInsights ? 'Analysing...' : 'AI Insights'}
          </button>
          <button 
            onClick={() => setActiveView('messages')}
            className={`p-2 rounded-lg transition-colors ${activeView === 'messages' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 w-64 border-r border-slate-800 p-4 space-y-1 bg-[#0a0f1d] z-50 transform transition-transform duration-300 ease-in-out shrink-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="px-4 py-2 mb-4">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Management</p>
          </div>
          <NavButton id="overview" label="Curriculum Manager" icon={Layout} color="indigo" />
          <NavButton id="monitor" label="Student Status" icon={Users} color="emerald" />
          <NavButton id="achievements" label="Achievements" icon={Award} color="amber" />
          
          <div className="mt-8 px-4 py-2">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Insights</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mt-2">
             <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Brain className="w-4 h-4" />
                <span className="text-xs font-bold">Smart Optimizer</span>
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed">
                {aiInsights || "Click the magic wand above to generate smart AI insights for your class curriculum."}
             </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#060a12] scroll-smooth">
          {activeView === 'overview' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
              <FeatureDashboard tabs={teacherTabs} mode="management" teacherId={profile.id} />
            </div>
          )}

          {activeView === 'monitor' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Real-time Class Status</h2>
                <p className="text-slate-400 mt-1 text-sm">Live visibility into student focus, reading guides, and progress.</p>
              </div>
              <StudentMonitor />
            </div>
          )}

          {activeView === 'messages' && (
            <div className="max-w-5xl mx-auto h-full">
              <MessageCenter role="teacher" userId={profile.id} />
            </div>
          )}

          {activeView === 'achievements' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Achievement Gifts</h2>
                <p className="text-slate-400 mt-1 text-sm">Manage rewards and unlockables for high-performing students.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 hover:border-indigo-500/50 transition-all group shadow-xl">
                   <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                      <Award className="w-6 h-6 text-amber-500" />
                   </div>
                   <h3 className="font-bold text-lg mb-2">Completion Gift Section</h3>
                   <p className="text-xs text-slate-400 mb-6 leading-relaxed">Assign rewards for students who finish all curriculum guides this week. Incentivize learning through play.</p>
                   <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-bold transition-colors border border-slate-700 uppercase tracking-widest">Configure Gifts</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
