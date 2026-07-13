const fs = require('fs');
let code = fs.readFileSync('components/StudyGuideApp.tsx', 'utf-8');

const targetStrStart = '{/* POMODORO CONTROLS & WORKSPACE SUBTABS */}';
const targetStrEnd = '</div>\n              </div>\n            </header>';

const startIndex = code.indexOf(targetStrStart);
const endIndex = code.indexOf(targetStrEnd, startIndex);

if(startIndex !== -1 && endIndex !== -1) {
  const newControls = `{/* POMODORO CONTROLS & WORKSPACE SUBTABS */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                {/* TIMER & MUSIC (SIMPLIFIED FOR KIDS) */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-2xl font-bold font-mono border border-indigo-500/20">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}</span>
                    <button onClick={() => setTimerIsRunning(!timerIsRunning)} className="ml-2 bg-indigo-500 text-white rounded-full p-1 transition-transform hover:scale-110 active:scale-95">
                      {timerIsRunning ? <Pause className="w-3 h-3"/> : <Play className="w-3 h-3"/>}
                    </button>
                    <button onClick={() => {
                        setTimerIsRunning(false);
                        setTimerSeconds(0);
                        if (timerMode === "focus") setTimerMinutes(timerDuration);
                        else setTimerMinutes(5);
                      }} className="ml-1 text-indigo-400 hover:text-indigo-600 p-1">
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <select
                    value={ambientSound}
                    onChange={(e) => {
                      const sound = e.target.value;
                      handleSelectAmbient(sound);
                    }}
                    className="font-bold py-1.5 pl-3 pr-8 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm cursor-pointer appearance-none"
                    style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23d97706%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right .7rem top 50%", backgroundSize: ".65rem auto" }}
                  >
                    <option value="none">{appLanguage === "en" ? "🤫 No Music" : "🤫 নীরব"}</option>
                    <option value="rainforest">{appLanguage === "en" ? "🌧️ Rainforest" : "🌧️ বৃষ্টি বন"}</option>
                    <option value="library">{appLanguage === "en" ? "📚 Library" : "📚 লাইব্রেরি"}</option>
                    <option value="lofi">{appLanguage === "en" ? "🎵 Lofi Beats" : "🎵 লো-ফাই বিট"}</option>
                  </select>
                </div>
`;
  
  const toReplace = code.substring(startIndex, endIndex);
  code = code.replace(toReplace, newControls);
  fs.writeFileSync('components/StudyGuideApp.tsx', code);
  console.log("Header updated successfully");
} else {
  console.log("Could not find the target string!");
}
