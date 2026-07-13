const fs = require('fs');
let code = fs.readFileSync('components/StudyGuideApp.tsx', 'utf-8');

const badgesUI = `
                      {/* ACHIEVEMENTS BADGES */}
                      <div className="p-6 rounded-2xl border dark:border-white/5 border-slate-200 dark:bg-[#080d19] bg-white shadow-md">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Flame className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight font-sans">Achievement Badges</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Earn badges by completing study milestones.</p>
                          </div>
                        </div>

                        {(() => {
                          const totalSecs = guides.reduce((acc, g) => acc + (g.studySeconds || 0), 0);
                          const totalMastered = guides.reduce((acc, g) => acc + (g.cardsMasteredCount || 0), 0);
                          
                          const badges = [
                            { 
                              id: "first_step", 
                              name: "First Step", 
                              desc: "Created your first study guide", 
                              icon: "🌟", 
                              unlocked: guides.length >= 1 
                            },
                            { 
                              id: "explorer", 
                              name: "Explorer", 
                              desc: "Created 5 study guides", 
                              icon: "🧭", 
                              unlocked: guides.length >= 5 
                            },
                            { 
                              id: "focus_master", 
                              name: "Focus Master", 
                              desc: "30 minutes of focus time", 
                              icon: "⏳", 
                              unlocked: totalSecs >= 1800 
                            },
                            { 
                              id: "flashcard_whiz", 
                              name: "Flashcard Whiz", 
                              desc: "Mastered 10 flashcards", 
                              icon: "🧠", 
                              unlocked: totalMastered >= 10 
                            },
                            { 
                              id: "streak_master", 
                              name: "Streak Master", 
                              desc: "3 day study streak", 
                              icon: "🔥", 
                              unlocked: streakCount >= 3 
                            },
                            { 
                              id: "quiz_legend", 
                              name: "Quiz Legend", 
                              desc: "50 cards mastered", 
                              icon: "👑", 
                              unlocked: totalMastered >= 50 
                            }
                          ];

                          return (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                              {badges.map((badge) => (
                                <div 
                                  key={badge.id}
                                  className={\`flex flex-col items-center text-center p-4 rounded-xl border \${
                                    badge.unlocked 
                                      ? "bg-emerald-500/10 border-emerald-500/20 shadow-sm" 
                                      : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 opacity-60 grayscale"
                                  }\`}
                                >
                                  <div className={\`text-3xl mb-2 \${badge.unlocked ? "animate-bounce-slight" : ""}\`}>
                                    {badge.icon}
                                  </div>
                                  <h5 className={\`text-xs font-bold \${badge.unlocked ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}\`}>
                                    {badge.name}
                                  </h5>
                                  <p className="text-[9px] text-slate-500 mt-1 leading-tight">{badge.desc}</p>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
`;

code = code.replace(badgesUI, '');
fs.writeFileSync('components/StudyGuideApp.tsx', code);
