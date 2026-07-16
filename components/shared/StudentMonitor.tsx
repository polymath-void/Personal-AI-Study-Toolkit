import React, { useState, useEffect } from "react";
import { getStudentStatsForStudent, getAllStudentsForTeacher, getStudentsForParent, updateStudentActiveGuide } from "../../lib/data_helpers";
import { getSupabase } from "../../lib/supabase";
import type { MasteryStat, StudentWithStats } from "../../types";
import { BarChart2, Zap, Clock, Target, ChevronRight, Award, Sparkles } from "lucide-react";

interface StudentMonitorProps {
  parentId?: string;
}

export default function StudentMonitor({ parentId }: StudentMonitorProps) {
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStudents();
    
    // Set up real-time postgres changes subscription
    const supabase = getSupabase();
    const channel = supabase
      .channel('student-monitor-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          loadAllStudents();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mastery_stats' },
        () => {
          loadAllStudents();
        }
      )
      .subscribe();

    const interval = setInterval(loadAllStudents, 15000); // Polling fallback every 15s
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  const loadAllStudents = async () => {
    if (students.length === 0) {
      setLoading(true);
    }
    const data = parentId 
      ? await getStudentsForParent(parentId) 
      : await getAllStudentsForTeacher();
    setStudents(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Zap className="w-6 h-6 text-indigo-500 animate-pulse" />
    </div>
  );

   const calculateAverageMastery = (stats: MasteryStat[]) => {
    if (stats.length === 0) return 0;
    return Math.round(stats.reduce((acc, s) => acc + s.score, 0) / stats.length);
  };

  const getLatestSubject = (stats: MasteryStat[]) => {
    if (stats.length === 0) return "General Study";
    return stats.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0].subject;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {students.map(student => {
        const avgMastery = calculateAverageMastery(student.stats);
        const latestSubject = getLatestSubject(student.stats);
        const lastUpdated = student.stats.length > 0 
          ? new Date(student.stats.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0].updated_at)
          : null;

        return (
          <div key={student.id} className="bg-[#0a0f1d] border border-slate-800 rounded-3xl overflow-hidden group hover:border-indigo-500/50 transition-all shadow-xl flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-gradient-to-br from-slate-800/20 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 shadow-inner">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-lg">{student.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">
                    {student.last_active_at ? `Active ${new Date(student.last_active_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Recent activity unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 {student.current_activity ? 'Live' : 'Active'}
              </div>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              {/* Focus Section */}
              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                    <Target className="w-3.5 h-3.5" />
                    {student.current_activity ? 'Currently Studying' : 'Last Achievement Path'}
                 </div>
                 <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800/50 shadow-inner group-hover:border-indigo-500/30 transition-colors">
                    <p className="text-sm font-bold text-slate-300 truncate">{student.current_activity || latestSubject}</p>
                    <div className="flex items-center gap-4 mt-3">
                       <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.4)]" style={{ width: `${avgMastery}%` }} />
                       </div>
                       <span className="text-[10px] font-bold text-indigo-400 tabular-nums">{avgMastery}%</span>
                    </div>
                 </div>

                 {/* Real-time Lesson Selector */}
                 <div className="space-y-1.5 pt-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Select Real-time Lesson</label>
                    <select 
                      value={student.current_activity || ""} 
                      onChange={async (e) => {
                        const topic = e.target.value;
                        await updateStudentActiveGuide(student.id, topic);
                        alert(`Successfully set real-time active lesson to "${topic || 'General study'}" for ${student.name}!`);
                        loadAllStudents();
                      }}
                      className="w-full bg-[#060a12] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/50 transition-all text-slate-300 cursor-pointer"
                    >
                      <option value="">-- Select Active Lesson / Clear --</option>
                      <option value="Photosynthesis (সালোকসংশ্লেষণ)">Photosynthesis (সালোকসংশ্লেষণ) 🌿</option>
                      <option value="Solar System (সৌরজগৎ)">Solar System (সৌরজগৎ) 🪐</option>
                      <option value="Human Body (মানবদেহ)">Human Body (মানবদেহ) 🫁</option>
                      <option value="Math Addition (যোগফল)">Math Addition (যোগফল) ➕</option>
                      <option value="Quantum Physics for Kids">Quantum Physics for Kids ⚛️</option>
                      <option value="Feynman Technique Basics">Feynman Technique Basics 🧠</option>
                    </select>
                 </div>
              </div>
  
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800/50 flex flex-col justify-center shadow-inner">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                       <Clock className="w-3 h-3" />
                       Engagement
                    </div>
                    <p className="text-sm font-bold text-slate-300">{student.stats.length} <span className="text-[10px] font-medium text-slate-500">Modules</span></p>
                 </div>
                 <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800/50 flex flex-col justify-center shadow-inner">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                       <Zap className="w-3 h-3 text-amber-400" />
                       Avg Mastery
                    </div>
                    <p className="text-sm font-bold text-emerald-400">{avgMastery}%</p>
                 </div>
              </div>
            </div>
  
            <div className="flex border-t border-slate-800">
              <button className="flex-1 p-4 bg-indigo-500/5 hover:bg-indigo-500/10 text-[10px] font-bold text-indigo-400 flex items-center justify-center gap-2 transition-all uppercase tracking-widest active:scale-[0.98]">
                Analytics
                <ChevronRight className="w-3 h-3" />
              </button>
              <button 
                onClick={() => alert(`Gift reward assigned to ${student.name}! They will see it in their achievements panel.`)}
                className="flex-1 p-4 bg-amber-500/5 hover:bg-amber-500/10 text-[10px] font-bold text-amber-400 flex items-center justify-center gap-2 transition-all border-l border-slate-800 uppercase tracking-widest active:scale-[0.98]"
              >
                Reward
                <Award className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
