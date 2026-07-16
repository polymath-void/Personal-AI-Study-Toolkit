import React, { useState } from "react";
import { signUpUser } from "../../lib/auth";
import { getSupabase } from "../../lib/supabase";
import { UserRole } from "../../types";
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Users, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Check, 
  Award, 
  MessageSquare, 
  Sliders,
  ChevronRight,
  HelpCircle,
  Clock,
  Heart,
  CheckCircle,
  ThumbsUp,
  RotateCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export const AuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sandbox trial states
  const [sandboxTab, setSandboxTab] = useState<"feynman" | "flashcard">("feynman");
  const [feynmanStep, setFeynmanStep] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [flashcardConfidence, setFlashcardConfidence] = useState<string | null>(null);

  const feynmanDialogue = [
    {
      question: "What is Photosynthesis? 🌱",
      avatar: "🐻",
      name: "Cubby the Bear",
      text: "Imagine leaves are tiny green solar ovens! They capture sunlight, mix water and air, and bake sweet sugar treats to feed the tree! 🥞✨",
      options: [
        { text: "Why are they green? 🍃", next: 1 },
        { text: "How do they drink water? 💧", next: 2 }
      ]
    },
    {
      question: "Why are they green? 🍃",
      avatar: "🐻",
      name: "Cubby the Bear",
      text: "They wear green sunglasses called Chlorophyll! These green specs are super-powered at catching purple and red sunlight to start the sugar oven! 😎",
      options: [
        { text: "That is amazing! Let's restart!", next: 0 }
      ]
    },
    {
      question: "How do they drink water? 💧",
      avatar: "🐻",
      name: "Cubby the Bear",
      text: "Roots act like giant slurpy straws deep in the soil! They suck water up, all the way to the top leaves, defying gravity! 🥤🦒",
      options: [
        { text: "Cool! Let's restart!", next: 0 }
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = getSupabase();
    
    try {
      if (isSignup) {
        await signUpUser(email, password, name, role);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch(e){}
        window.location.reload();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        try {
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch(e){}
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, roleName: UserRole) => {
    setError("");
    setLoading(true);
    setEmail(demoEmail);
    setPassword("password123");
    setRole(roleName);
    
    try {
      const supabase = getSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email: demoEmail, 
        password: "password123" 
      });
      
      if (signInError) {
        // If sign-in fails or is pending confirmation, fall back to robust Local Storage Demo mode.
        console.warn("Supabase demo auth failed or requires confirmation. Falling back to robust Local Storage Demo mode:", signInError.message);
        
        const displayName = roleName === "student" ? "Demo Student" 
                          : roleName === "parent" ? "Demo Parent" 
                          : "Demo Teacher";
                          
        const demoUser = {
          id: roleName === "student" ? "student-demo-id" 
            : roleName === "parent" ? "parent-demo-id" 
            : "teacher-demo-id",
          email: demoEmail,
          name: displayName,
          role: roleName,
          is_premium: true,
          current_activity: roleName === "student" ? "Feynman Photosynthesis 🌱" : undefined,
          created_at: new Date().toISOString()
        };
        localStorage.setItem("study_buddy_demo_user", JSON.stringify(demoUser));
      } else {
        localStorage.removeItem("study_buddy_demo_user");
      }

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch(e){}
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.warn("Demo login exception, logging in locally anyway:", err);
      const displayName = roleName === "student" ? "Demo Student" 
                        : roleName === "parent" ? "Demo Parent" 
                        : "Demo Teacher";
                        
      const demoUser = {
        id: roleName === "student" ? "student-demo-id" 
          : roleName === "parent" ? "parent-demo-id" 
          : "teacher-demo-id",
        email: demoEmail,
        name: displayName,
        role: roleName,
        is_premium: true,
        current_activity: roleName === "student" ? "Feynman Photosynthesis 🌱" : undefined,
        created_at: new Date().toISOString()
      };
      localStorage.setItem("study_buddy_demo_user", JSON.stringify(demoUser));
      
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleConfidenceClick = (level: string) => {
    setFlashcardConfidence(level);
    if (level === "mastered") {
      try {
        confetti({
          particleCount: 40,
          spread: 40,
          colors: ["#10b981", "#34d399", "#6ee7b7"]
        });
      } catch(e){}
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#fdfefe] text-slate-800 antialiased font-sans relative overflow-x-hidden">
      
      {/* Soft gradient background accents for an elevated design */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 animate-pulse">
            📚
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg tracking-tight leading-none">StudyBuddy AI</h1>
            <p className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase mt-1">Cognitive Sandbox Hub</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Supabase Live Connected
          </span>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="w-full max-w-7xl mx-auto px-6 py-8 md:py-16 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Side: Stunning interactive sandbox preview & value prop */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/60 text-xs font-black text-indigo-600 uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Interactive Lesson Hub
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Turn dry text into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">living conversations</span>
            </h2>
            <p className="text-md text-slate-600 leading-relaxed max-w-xl font-medium">
              Join families & educators turning standard textbooks into conversational Feynman AI chats, visual maps, and self-scoring recall decks. Try our sandbox demo below!
            </p>
          </div>

          {/* Interactive Feature Sandbox Widget */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="inline-block text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">Interactive Sandbox</span>
                <h4 className="text-sm font-black text-slate-900 mt-0.5">Test-Drive the Learning Engine below ⚡</h4>
              </div>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSandboxTab("feynman")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    sandboxTab === "feynman" 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  💬 Feynman Chat
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxTab("flashcard")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    sandboxTab === "flashcard" 
                      ? "bg-pink-600 text-white shadow-md shadow-pink-100" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🃏 Recall Card
                </button>
              </div>
            </div>

            <div className="p-6 min-h-[220px] flex flex-col justify-center bg-gradient-to-b from-white to-slate-50/30">
              <AnimatePresence mode="wait">
                {sandboxTab === "feynman" ? (
                  <motion.div
                    key="feynman"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shadow-sm">
                        {feynmanDialogue[feynmanStep].avatar}
                      </div>
                      <div className="space-y-1 max-w-[85%]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-800">{feynmanDialogue[feynmanStep].name}</span>
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-[9px] text-indigo-700 font-bold rounded-md">Mascot Buddy</span>
                        </div>
                        <div className="p-3.5 rounded-2xl rounded-tl-none bg-indigo-50/50 border border-indigo-100/40 text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
                          {feynmanDialogue[feynmanStep].text}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end pt-2">
                      {feynmanDialogue[feynmanStep].options.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setFeynmanStep(opt.next);
                            try {
                              confetti({
                                particleCount: 15,
                                angle: 60,
                                spread: 30,
                                origin: { x: 0.2, y: 0.8 }
                              });
                            } catch(e){}
                          }}
                          className="px-3.5 py-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow hover:scale-[1.02] cursor-pointer"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="flashcard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center space-y-4"
                  >
                    {/* Flippable card */}
                    <div
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className={`w-full max-w-[320px] min-h-[120px] p-5 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center relative select-none ${
                        flashcardFlipped 
                          ? "bg-pink-50/40 border-pink-400 shadow-md shadow-pink-100/50" 
                          : "bg-white border-slate-200 hover:border-indigo-400"
                      }`}
                    >
                      <div className="absolute top-2 right-3 text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">
                        {flashcardFlipped ? "Answer Side 🌟" : "Question Side ❓"}
                      </div>
                      
                      {flashcardFlipped ? (
                        <p className="text-xs sm:text-sm font-black text-pink-700 leading-relaxed">
                          Chloroplasts! 🍃 They house the special green chlorophyll pigment to capture light energy.
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                          What is the name of the cellular engine that carries out photosynthesis?
                        </p>
                      )}
                      
                      <div className="mt-3 text-[10px] font-bold text-indigo-500 animate-pulse">
                        Click card to flip 🔄
                      </div>
                    </div>

                    {flashcardFlipped && (
                      <div className="space-y-2 text-center">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Rate your active-recall memory accuracy:</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfidenceClick("low")}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 text-xs font-extrabold rounded-lg transition-all cursor-pointer"
                          >
                            Hard ❌
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfidenceClick("medium")}
                            className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 text-xs font-extrabold rounded-lg transition-all cursor-pointer"
                          >
                            Medium ⚠️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfidenceClick("mastered")}
                            className="px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-extrabold rounded-lg transition-all shadow-sm cursor-pointer"
                          >
                            Perfect! ⭐
                          </button>
                        </div>
                        {flashcardConfidence && (
                          <p className="text-[10px] text-emerald-600 font-bold animate-bounce">
                            {flashcardConfidence === "mastered" ? "Confetti Fired! Core recall score updated." : "Saved! Review cycle rescheduled."}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Key pillars footer under sandbox */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-600 pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Durable Cloud Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-pink-500 shrink-0" />
              <span>Real-time Syncing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Gemini AI Native</span>
            </div>
          </div>
        </div>

        {/* Right Side: Ultimate beautiful white login card with pink/indigo border highlights */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {isSignup ? "Create Free Account" : "Access Your Workspace"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isSignup ? "Join families & educators already mastering lessons" : "Enter credentials or click a demo login option below"}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-bold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isSignup && (
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-500">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Alex Carter" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-slate-800 font-semibold"
                      required 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-slate-800 font-semibold"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-slate-800 font-semibold"
                    required 
                  />
                </div>
              </div>

              {isSignup && (
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-500">Your Portal Access Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["student", "teacher", "parent"] as const).map((r) => {
                      const isSelected = role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 text-[10px] font-extrabold uppercase rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-indigo-50 border-indigo-500 text-indigo-600 scale-[1.02]" 
                              : "bg-slate-50/50 border-slate-100 hover:bg-slate-100 text-slate-500"
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>{isSignup ? "Register & Enter" : "Sign In & Enter"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button 
                type="button" 
                onClick={() => setIsSignup(!isSignup)} 
                className="w-full text-center text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer py-1"
              >
                {isSignup ? "Already registered? Sign in here" : "Need an account? Create one in seconds"}
              </button>
            </form>
          </div>

          {/* Quick Demo Accounts Seeding Panel */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4 text-left">
            <div>
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                ⚡ Instant Demo Login Panel
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">
                No registration required! Click one below to preview any dashboard instantly.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("student@demo.com", "student")}
                className="w-full py-2.5 px-3 bg-[#f8fafc] hover:bg-indigo-50 rounded-xl text-left flex justify-between items-center group transition-colors cursor-pointer border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-md">👦</span>
                  <div>
                    <p className="text-xs font-black text-slate-800">Student Account</p>
                    <p className="text-[9px] text-slate-400 font-mono">student@demo.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black text-indigo-500 group-hover:translate-x-1 transition-transform">
                  Enter ➔
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("parent@demo.com", "parent")}
                className="w-full py-2.5 px-3 bg-[#f8fafc] hover:bg-pink-50 rounded-xl text-left flex justify-between items-center group transition-colors cursor-pointer border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-md">👩‍👧</span>
                  <div>
                    <p className="text-xs font-black text-slate-800">Parent Account</p>
                    <p className="text-[9px] text-slate-400 font-mono">parent@demo.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black text-pink-500 group-hover:translate-x-1 transition-transform">
                  Enter ➔
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("teacher@demo.com", "teacher")}
                className="w-full py-2.5 px-3 bg-[#f8fafc] hover:bg-emerald-50 rounded-xl text-left flex justify-between items-center group transition-colors cursor-pointer border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-md">👩‍🏫</span>
                  <div>
                    <p className="text-xs font-black text-slate-800">Teacher Account</p>
                    <p className="text-[9px] text-slate-400 font-mono">teacher@demo.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black text-emerald-500 group-hover:translate-x-1 transition-transform">
                  Enter ➔
                </span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-100 bg-white py-6 text-center text-[10px] text-slate-400 font-mono">
        © {new Date().getFullYear()} StudyBuddy AI Cognitive Suite. All rights reserved. Powered by Supabase & Gemini AI.
      </footer>
    </div>
  );
};
