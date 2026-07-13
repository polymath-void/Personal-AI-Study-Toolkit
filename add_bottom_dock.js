const fs = require('fs');
let code = fs.readFileSync('components/StudyGuideApp.tsx', 'utf-8');

const targetStr = `              </AnimatePresence>
            </div>

          </div>`;

const bottomDockUI = `              </AnimatePresence>
            </div>

            {/* BOTTOM NAVIGATION DOCK (KIDS UI) */}
            <div className="bg-white dark:bg-[#080d19] border-t dark:border-white/5 border-slate-200 p-2 md:p-3 shrink-0 flex justify-center z-40 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
              <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 max-w-full w-full justify-start md:justify-center no-scrollbar px-2">
                  {([
                    { id: "feynman", label: t.feynmanDeconstruction, icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { id: "mindmap", label: t.mindmap, icon: Compass, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { id: "flashcards", label: t.flashcards, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { id: "clarifier", label: t.clarifier, icon: HelpCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
                    { id: "voiceChat", label: t.voiceChat, icon: Mic, color: "text-rose-500", bg: "bg-rose-500/10" },
                    { id: "dashboard", label: t.dashboard, icon: BarChart2, color: "text-indigo-500", bg: "bg-indigo-500/10" }
                  ] as const).map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    const isChatTab = tab.id === "clarifier" || tab.id === "voiceChat";

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={\`relative flex flex-col items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-3 rounded-[20px] transition-transform active:scale-95 shrink-0 cursor-pointer min-w-[75px] sm:min-w-[100px] z-10 \${
                          isSelected
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }\`}
                        id={\`tab_btn_\${tab.id}\`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeTabIndicatorBottom"
                            className={\`absolute inset-0 \${tab.bg} rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm\`}
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex flex-col items-center gap-1.5">
                          <Icon className={\`w-6 h-6 sm:w-8 sm:h-8 \${isSelected ? tab.color : ""} \${isChatTab && !isSelected ? "animate-pulse" : ""}\`} />
                          <span className={\`text-[10px] sm:text-xs font-bold font-heading \${isSelected ? "opacity-100" : "opacity-70"} text-center leading-tight max-w-[80px]\`}>
                            {tab.label}
                          </span>
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

          </div>`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, bottomDockUI);
  fs.writeFileSync('components/StudyGuideApp.tsx', code);
  console.log("Dock added successfully");
} else {
  console.log("Could not find the target string!");
}
