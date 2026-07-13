const fs = require('fs');
let code = fs.readFileSync('components/StudyGuideApp.tsx', 'utf-8');

const didYouKnowModalUI = `
      {/* Did You Know Modal */}
      <AnimatePresence>
        {showDidYouKnow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#0c1221] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowDidYouKnow(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mb-2">
                  <Lightbulb className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  {appLanguage === "en" ? "Did You Know? 🤯" : "তুমি কি জানো? 🤯"}
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-300 min-h-[60px] flex items-center justify-center">
                  {isFetchingFact ? (
                    <div className="flex flex-col items-center gap-2">
                      <RotateCw className="w-5 h-5 animate-spin text-amber-500" />
                      <span className="text-xs text-slate-500 font-mono">Fetching fact...</span>
                    </div>
                  ) : (
                    <p className="font-semibold leading-relaxed">{didYouKnowFact}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowDidYouKnow(false)}
                  className="w-full py-3 mt-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-md transition-transform active:scale-95"
                >
                  {appLanguage === "en" ? "Awesome!" : "দারুণ!"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

code = code.replace('</main>\n    </div>\n  );\n}', '</main>\n' + didYouKnowModalUI + '\n    </div>\n  );\n}');
fs.writeFileSync('components/StudyGuideApp.tsx', code);
