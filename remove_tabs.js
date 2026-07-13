const fs = require('fs');
let code = fs.readFileSync('components/StudyGuideApp.tsx', 'utf-8');

const targetStr = `                {/* Study Workspace Sub-tabs */}
                <div className="flex p-1.5 dark:bg-[#0c1221] bg-slate-100 rounded-xl border dark:border-white/5 border-slate-200 overflow-x-auto w-full sm:w-auto relative">
                  {([
                    { id: "feynman", label: t.feynmanDeconstruction, icon: Lightbulb },
                    { id: "mindmap", label: t.mindmap, icon: Compass },
                    { id: "flashcards", label: t.flashcards, icon: CheckCircle2 },
                    { id: "clarifier", label: t.clarifier, icon: HelpCircle },
                    { id: "dashboard", label: t.dashboard, icon: BarChart2 },
                    { id: "voiceChat", label: t.voiceChat, icon: Mic }
                  ] as const).map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    const isChatTab = tab.id === "clarifier" || tab.id === "voiceChat";

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={\`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-colors shrink-0 cursor-pointer min-h-[44px] z-10 \${
                          isSelected
                            ? "text-emerald-900 dark:text-emerald-100"
                            : isChatTab
                              ? "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        }\`}
                        id={\`tab_btn_\${tab.id}\`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-lg border border-emerald-500/30 dark:border-emerald-400/30"
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <Icon className={\`w-4 h-4 \${isChatTab && !isSelected ? "animate-pulse" : ""}\`} />
                          <span className="hidden md:inline">{tab.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, '');
  fs.writeFileSync('components/StudyGuideApp.tsx', code);
  console.log("Tabs removed successfully");
} else {
  console.log("Could not find the target string!");
}
