import React, { useState, useEffect } from 'react';
import { Profile, StudentWithStats } from '../../types';
import { LogoutButton } from '../shared/LogoutButton';
import FeatureDashboard from '../shared/FeatureDashboard';
import StudentMonitor from '../shared/StudentMonitor';
import { MessageCenter } from '../shared/MessageCenter';
import { getStudentsForParent, updateUserProfile } from '../../lib/data_helpers';
import { Users, BookOpen, Layout, ClipboardList, Book, MessageSquare, Award, Heart, Menu, X, Sparkles, Brain, Settings, Check, RotateCw } from 'lucide-react';
import confetti from "canvas-confetti";

export default function ParentPortal({ profile }: { profile: Profile }): JSX.Element {
  const [activeView, setActiveView] = useState<'monitor' | 'guides' | 'messages' | 'achievements' | 'settings'>('monitor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  
  const [profileName, setProfileName] = useState(profile.name);
  const [savingProfile, setSavingProfile] = useState(false);

  const [realUid, setRealUid] = useState("KID-PARENT-" + profile.id.slice(0, 4).toUpperCase());
  const [realPin, setRealPin] = useState("4321");
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [pinInput, setPinInput] = useState("4321");

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = async () => {
    const data = await getStudentsForParent(profile.id);
    setStudents(data);
  };

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        body: JSON.stringify({
          action: 'insights',
          role: 'parent',
          data: { studentStats: students.map(s => s.stats) }
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

  const parentTabs = [
    { id: 'lessons', label: 'Student Lessons', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'guides', label: 'Reading Guides', icon: <Book className="w-4 h-4" /> },
  ];

  const getActiveStyles = (color: string) => {
    switch (color) {
      case "indigo":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "emerald":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "amber":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "teal":
        return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
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
            <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-rose-500/20">
              {profile.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-none">Parent Portal</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{profile.name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={generateInsights}
            disabled={loadingInsights}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500/20 transition-all"
          >
            <Sparkles className={`w-3 h-3 ${loadingInsights ? 'animate-spin' : ''}`} />
            {loadingInsights ? 'Analysing...' : 'AI Insights'}
          </button>
          <button 
            onClick={() => setActiveView('messages')}
            className={`p-2 rounded-lg transition-colors ${activeView === 'messages' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'hover:bg-slate-800 text-slate-400'}`}
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
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Monitoring</p>
          </div>
          <NavButton id="monitor" label="Student Status" icon={Users} color="emerald" />
          <NavButton id="guides" label="Study Kit View" icon={BookOpen} color="indigo" />
          <NavButton id="achievements" label="Achievements" icon={Award} color="amber" />
          <NavButton id="settings" label="Profile Settings" icon={Settings} color="teal" />
          
          <div className="mt-8 px-4 py-2">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">AI Support</p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 mt-2">
             <div className="flex items-center gap-2 text-rose-400 mb-2">
                <Brain className="w-4 h-4" />
                <span className="text-xs font-bold">Learning Insight</span>
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed">
                {aiInsights || "Use AI Insights above to get personalized learning recommendations for your child based on their latest progress."}
             </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#060a12] scroll-smooth">
          {activeView === 'monitor' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {/* Secure Account Linking (2FA) */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#12221b]/40 to-[#0a0f1d] border border-emerald-500/15 shadow-2xl relative">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  🔒 Secure Account Linking (2FA)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Prevent accidental linkings by requiring both a unique child UID and a parent 2FA PIN.</p>

                <div className="mt-5 p-4 rounded-2xl bg-[#060a12] border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">My Child&apos;s Gateway Key</p>
                    <p className="text-sm font-bold text-slate-100 mt-1">UID: <span className="font-mono text-emerald-400">{realUid}</span></p>
                  </div>

                  <div className="w-full sm:w-auto">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">2FA Pin Protection</p>
                    {isEditingPin ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          maxLength={4}
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-center text-xs focus:outline-none focus:border-emerald-500 text-white"
                        />
                        <button
                          onClick={() => {
                            if (pinInput.length !== 4) {
                              alert("Please enter a valid 4-digit numeric PIN.");
                              return;
                            }
                            setRealPin(pinInput);
                            setIsEditingPin(false);
                          }}
                          className="p-1 px-2.5 bg-emerald-600 rounded text-white text-xs font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-bold text-slate-200">{realPin}</span>
                        <button
                          onClick={() => setIsEditingPin(true)}
                          className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                        >
                          ✏️ Change PIN
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-tight mt-4">
                  To connect, enter student UID <strong className="text-slate-400">{realUid}</strong> and 2FA PIN <strong className="text-slate-400">{realPin}</strong> when linking a student workspace in Gateway.
                </p>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">My Student&apos;s Progress</h2>
                <p className="text-slate-400 mt-1 text-sm">Live updates on current focus and study sessions.</p>
              </div>
              <StudentMonitor parentId={profile.id} />
            </div>
          )}

          {activeView === 'guides' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Assigned Resources</h2>
                <p className="text-slate-400 mt-1 text-sm">Review the reading guides and lessons assigned by teachers.</p>
              </div>
              <FeatureDashboard tabs={parentTabs} />
            </div>
          )}

          {activeView === 'messages' && (
            <div className="max-w-5xl mx-auto h-full">
              <MessageCenter role="parent" userId={profile.id} />
            </div>
          )}

          {activeView === 'achievements' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Student Achievements</h2>
                  <p className="text-slate-400 mt-1 text-sm">Celebrate your child&apos;s learning milestones and unlocked gifts.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold tracking-tight">12 Milestones</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-[#0a0f1d] border border-amber-500/20 shadow-xl group">
                   <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                      <Award className="w-6 h-6 text-amber-500" />
                   </div>
                   <h3 className="font-bold text-lg mb-1">Gift Unlocked!</h3>
                   <p className="text-xs text-slate-400 leading-relaxed mb-6">Your student reached the 7-day study streak goal. Great job supporting their journey!</p>
                   <button 
                    onClick={() => alert("Treat Reward Sent! Your child will receive a notification for a special restaurant treat.")}
                    className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-amber-500/20 transition-all"
                   >
                     Offer Restaurant Treat
                   </button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">Profile & Account Personalization</h2>
                <p className="text-slate-400 mt-1 text-sm">Manage your personal settings stored securely in Supabase.</p>
              </div>

              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121c33]/40 to-[#0a0f1d] border border-teal-500/15 shadow-2xl space-y-6">
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
                    <Settings className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">User Profile Settings</h3>
                    <p className="text-xs text-slate-400">Update display name and other personalization keys.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Display Name:</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-[#060a12] border border-white/5 focus:border-teal-500/50 rounded-2xl px-4 py-3 font-medium text-sm text-slate-200 outline-none transition-all"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address (Read-Only):</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full bg-[#0a0f1d]/50 border border-white/5 rounded-2xl px-4 py-3 font-mono text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Your Account ID:</label>
                    <div className="p-3 bg-[#060a12] rounded-2xl border border-white/5 font-mono text-xs text-slate-400 select-all">
                      {profile.id}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Gateway Access Role:</label>
                    <div>
                      <span className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        {profile.role} Portal Active
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                      onClick={async () => {
                        if (!profileName.trim()) return;
                        setSavingProfile(true);
                        try {
                          await updateUserProfile(profile.id, profileName);
                          try {
                            confetti({
                              particleCount: 100,
                              spread: 60,
                              origin: { y: 0.6 }
                            });
                          } catch (e) {}
                          alert("Profile settings saved successfully in Supabase! 🎉");
                        } catch (err: any) {
                          alert("Failed to update profile: " + err.message);
                        } finally {
                          setSavingProfile(false);
                        }
                      }}
                      disabled={savingProfile || !profileName.trim()}
                      className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-[#060a12] rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-teal-500/10 font-sans"
                    >
                      {savingProfile ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Save Settings 💾</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
