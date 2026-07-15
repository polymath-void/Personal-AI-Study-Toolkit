import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface GeminiAssistantProps {
  activeGuide: any;
  appLanguage: string;
}

export default function GeminiAssistant({ activeGuide, appLanguage }: GeminiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isInternalBengali = true; // AI engine operates in Bengali local language
  const isAppBengali = appLanguage === 'bn';
  const isBengali = isInternalBengali;

  // Custom rich-formatting renderer to handle bullet points and bold tags securely
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• ');
      let content = line;
      if (isBullet) {
        content = line.trim().replace(/^[\*\-\•]\s+/, '');
      }

      // Split by bold markup (e.g. **bold**)
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const parsedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-extrabold text-slate-900 dark:text-slate-100">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 my-0.5 pl-2">
            <span className="text-emerald-500 shrink-0 mt-1.5">•</span>
            <span className="flex-1">{parsedLine}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className={lineIdx > 0 ? "mt-1.5" : ""}>
          {parsedLine}
        </p>
      );
    });
  };

  // Set default initial greeting when chat history is empty
  useEffect(() => {
    if (chatHistory.length === 0) {
      const defaultGreeting: Message = {
        sender: 'ai',
        text: "হ্যালো! আমি তোমার ম্যাজিকাল এআই স্টাডি বাডি! 🐻✨ তোমার পড়াশোনা নিয়ে যেকোনো প্রশ্ন আমাকে জিজ্ঞেস করতে পারো, আমি সবকিছু খুব সহজ এবং মজার উপায়ে বুঝিয়ে দেবো! বল তো তুমি আজকে কী শিখতে চাও? 🚀",
        timestamp: new Date(),
      };
      setChatHistory([defaultGreeting]);
    }
  }, [chatHistory.length]);

  // Scroll to bottom whenever messages change or assistant is opened
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [chatHistory, isOpen]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMsgText = inputMessage.trim();
    setInputMessage('');

    const newUserMessage: Message = {
      sender: 'user',
      text: userMsgText,
      timestamp: new Date(),
    };

    // Add user message to history
    setChatHistory((prev) => [...prev, newUserMessage]);
    setIsGenerating(true);

    try {
      const getApiConfig = () => {
        try {
          return {
            operator: localStorage.getItem("feynman_api_operator") || "gemini",
            model: localStorage.getItem("feynman_api_model") || "gemini-3.5-flash",
            customUrl: localStorage.getItem("feynman_api_custom_url") || ""
          };
        } catch (e) {
          return { operator: "gemini", model: "gemini-3.5-flash", customUrl: "" };
        }
      };

      // Direct call to our robust server-side gemini route
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          question: userMsgText,
          studyGuideContext: activeGuide,
          language: 'bn',
          history: chatHistory.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          })),
          apiConfig: getApiConfig()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data = await response.json();
      const aiReply = data.text || 'দুঃখিত, আমি উত্তর তৈরি করতে পারিনি।';

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching assistant response:', error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'উফ! আমার জাদুকরী শক্তি সাময়িকভাবে কাজ করছে না। দয়া করে ইন্টারনেট সংযোগ চেক করো এবং সেটিংসে এপিআই কী দেওয়া আছে কি না তা দেখে নাও! 🔌✨',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
  };

  return (
    <>
      {/* Floating Trigger Button - Reduced size and highly optimized */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
            {/* Soft Glow Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 rounded-full blur-lg opacity-40 animate-pulse pointer-events-none" />

            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 z-10 select-none rounded-full border border-white/20 group hover:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              id="ask_ai_assistant_trigger"
            >
              <div className="relative">
                <Bot className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" />
              </div>
              <span className="tracking-wide text-xs font-bold">
                {isAppBengali ? 'বাডিকে জিজ্ঞেস করো 🐻' : 'Ask AI Buddy 🐻✨'}
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Animated Assistant Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 180 }}
            className="fixed bottom-6 right-6 w-96 max-w-[92vw] h-[500px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl z-50 p-4 border border-slate-200 dark:border-slate-800 text-left overflow-hidden flex flex-col"
            style={{
              boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(16, 185, 129, 0.08)'
            }}
          >
            {/* Top accent liquid band */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />

            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 relative z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Bot className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-slate-800 dark:text-white tracking-tight flex items-center gap-1">
                    {isAppBengali ? 'স্টাডি বাডি 🐻' : 'AI Study Buddy 🐻'}
                    <Sparkles className="text-yellow-400 w-3 h-3 animate-pulse" />
                  </h3>
                  <p className="text-[9px] text-emerald-500 dark:text-emerald-400 font-semibold uppercase tracking-wider font-mono">
                    {isAppBengali ? 'সহজ পড়ালেখা সহকারী' : 'Educational Buddy'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {chatHistory.length > 1 && (
                  <button
                    onClick={handleClearChat}
                    title={isAppBengali ? 'চ্যাট মুছুন' : 'Clear Chat'}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto p-2 my-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-emerald-500 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-none px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    </motion.div>
                    <span>{isBengali ? 'বাডি ভাবছে... 💭' : 'Buddy is thinking... 💭'}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box Area */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 shrink-0">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    isBengali
                      ? 'যেকোনো সহজ প্রশ্ন করো... (যেমন: সালোকসংশ্লেষণ কী?)'
                      : 'Ask anything... (e.g. Why is the sky blue?)'
                  }
                  className="flex-1 pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isGenerating || !inputMessage.trim()}
                  className="absolute right-1.5 p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center mt-2 font-mono">
                {isBengali
                  ? '🔒 শিক্ষামূলক উদ্দেশ্যে ব্যবহারের জন্য সুসংগঠিত জিপিটি অ্যাক্সেস'
                  : '🔒 High-speed educational AI assistance • Kids Study Kit'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
