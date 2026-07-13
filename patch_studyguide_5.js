const fs = require('fs');
let code = fs.readFileSync('components/StudyGuideApp.tsx', 'utf-8');

const voiceChatUI = `
                {/* Voice Chat Tab */}
                {activeTab === "voiceChat" && (
                  <motion.div
                    key="voiceChat"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-220px)] border dark:border-white/5 border-slate-200 dark:bg-[#070b14] bg-white rounded-2xl shadow-xl overflow-hidden text-left"
                    id="voice_chat_panel"
                  >
                    {/* Header */}
                    <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 p-4 flex justify-between items-center z-10 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 rounded-xl flex items-center justify-center animate-pulse">
                          <Mic className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                            {appLanguage === "en" ? "Voice Chat Buddy 🎙️" : "ভয়েস চ্যাট বাডি 🎙️"}
                          </h3>
                          <p className="text-[10px] text-slate-500">
                            {appLanguage === "en" 
                              ? "Powered by AI & HuggingFace Models (Kid-Safe)" 
                              : "এআই এবং হাগিংফেস মডেল দ্বারা চালিত (বাচ্চাদের জন্য নিরাপদ)"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setVoiceChatHistory([]);
                          setVoiceChatInput("");
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {t.clearChat}
                      </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                      {voiceChatHistory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                          <Mic className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {appLanguage === "en"
                              ? "Hi! I am your Voice Chat Buddy. Click the microphone to start talking to me."
                              : "হ্যালো! আমি তোমার ভয়েস চ্যাট বাডি। আমার সাথে কথা বলতে মাইক্রোফোনে ক্লিক করো।"}
                          </p>
                        </div>
                      ) : (
                        voiceChatHistory.map((msg, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={\`flex \${msg.role === "user" ? "justify-end" : "justify-start"}\`}
                          >
                            <div
                              className={\`max-w-[85%] rounded-2xl px-4 py-3 \${
                                msg.role === "user"
                                  ? "bg-indigo-600 text-white rounded-br-sm shadow-sm"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-white/5"
                              }\`}
                            >
                              {msg.role === "bot" && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 block mb-1">
                                  Buddy 🐻
                                </span>
                              )}
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                      
                      {isVoiceChatting && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl rounded-bl-sm px-4 py-3 border border-slate-200 dark:border-white/5">
                            <div className="flex gap-1.5 items-center h-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 shrink-0">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleVoiceChatSubmit();
                        }}
                        className="flex items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={\`p-3 rounded-full transition-all \${
                            isListening
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                          }\`}
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                        <input
                          type="text"
                          value={voiceChatInput}
                          onChange={(e) => setVoiceChatInput(e.target.value)}
                          placeholder={
                            isListening
                              ? (appLanguage === "en" ? "Listening..." : "শুনছি...")
                              : (appLanguage === "en" ? "Type or click mic to speak..." : "লিখুন অথবা মাইকে ক্লিক করুন...")
                          }
                          className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                          disabled={isVoiceChatting}
                        />
                        <button
                          type="submit"
                          disabled={!voiceChatInput.trim() || isVoiceChatting}
                          className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
`;

code = code.replace('{activeTab === "dashboard" && (', voiceChatUI + '\n                {activeTab === "dashboard" && (');
fs.writeFileSync('components/StudyGuideApp.tsx', code);
