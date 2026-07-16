import React, { useState, useEffect, useRef } from "react";
import { getMessagesForUser, sendMessage } from "../../lib/data_helpers";
import { getSupabase } from "../../lib/supabase";
import type { Message, Profile } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Users, MessageSquare, Search, Zap, Sparkles, 
  Bot, Bell, Loader2, Volume2, VolumeX, Check, CheckCheck 
} from "lucide-react";

// Web Audio API Synthesizer Chimes
const playMessageChime = (type: 'sent' | 'received') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    if (type === 'sent') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.1); // G5
    } else {
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.15); // C5
    }
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    console.warn("Audio Context chime failed", e);
  }
};

export const MessageCenter = ({ role, userId }: { role: 'teacher' | 'parent' | 'student'; userId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [selectedContact, setSelectedContact] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Audio configuration setting (muted by default to respect privacy/UX)
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // AI Suggestions and Typing state
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Real-time Push Notification Banner State
  const [incomingNotification, setIncomingNotification] = useState<{ 
    senderId: string; 
    senderName: string; 
    content: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // AI companion setup based on current role
  const aiContactId = role === 'student' ? 'ai-tutor-companion' : 'ai-educational-advisor';
  const aiContactName = role === 'student' ? '✨ Sparkles the AI Tutor' : '💡 AI Educational Advisor';
  const aiContact: Profile = {
    id: aiContactId,
    name: aiContactName,
    email: 'ai@studybuddy.com',
    role: role === 'student' ? 'teacher' : (role === 'parent' ? 'teacher' : 'parent'),
    created_at: new Date().toISOString()
  };

  useEffect(() => {
    loadContacts();
    loadMessages();
    
    // Supabase Realtime Subscription
    const supabase = getSupabase();
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        (payload: any) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [newMsg, ...prev]);
          
          if (audioEnabled) {
            playMessageChime('received');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, audioEnabled]);

  // Handle incoming notification banner detection
  useEffect(() => {
    if (messages.length === 0) return;
    const latestMessage = messages[0];
    
    // Only trigger if it is a received message and not from our current active chat
    if (latestMessage.sender_id !== userId) {
      if (!selectedContact || latestMessage.sender_id !== selectedContact.id) {
        // Find sender profile
        let sender = contacts.find(c => c.id === latestMessage.sender_id);
        if (!sender && latestMessage.sender_id === aiContactId) {
          sender = aiContact;
        }
        
        if (sender) {
          setIncomingNotification({
            senderId: sender.id,
            senderName: sender.name,
            content: latestMessage.content
          });
          
          if (audioEnabled) {
            playMessageChime('received');
          }
          
          const timer = setTimeout(() => {
            setIncomingNotification(null);
          }, 5000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [messages, selectedContact, contacts, userId, audioEnabled]);

  // Fetch AI suggested responses for direct conversation
  useEffect(() => {
    if (selectedContact) {
      // Clear suggestions first
      setAiSuggestions([]);
      // Fetch suggestions if it's a real user (not AI helper itself)
      if (selectedContact.id !== aiContactId) {
        fetchAiSuggestions(selectedContact);
      }
    }
    // Auto scroll to bottom
    scrollToBottom();
  }, [selectedContact, messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadContacts = async () => {
    const supabase = getSupabase();
    let query = supabase.from('profiles').select('*');
    
    if (role === 'teacher') {
      query = query.in('role', ['student', 'parent']);
    } else if (role === 'parent') {
      query = query.in('role', ['teacher', 'student']);
    } else if (role === 'student') {
      query = query.in('role', ['teacher', 'parent']);
    }

    const { data, error } = await query;
    let allProfiles: Profile[] = [];
    if (!error && data) {
      allProfiles = [...data] as Profile[];
    }
    
    // Fallbacks if profiles table doesn't have contacts
    const targetRoles = role === 'teacher' ? ['parent', 'student'] 
                      : role === 'parent' ? ['teacher', 'student'] 
                      : ['teacher', 'parent'];
                      
    targetRoles.forEach(targetRole => {
      const hasRole = allProfiles.some(p => p.role === targetRole);
      if (!hasRole) {
        const mockContact: Profile = {
          id: `mock-${targetRole}-id`,
          name: targetRole === 'teacher' ? 'Prof. Sarah Vance (Educator)' 
              : targetRole === 'parent' ? 'Mr. Robert Smith (Parent)' 
              : 'Alex Smith (Super Student 🌟)',
          email: `${targetRole}@example.com`,
          role: targetRole as any,
          created_at: new Date().toISOString()
        };
        allProfiles.push(mockContact);
      }
    });

    // Prepend the specialized AI Companion
    const finalContacts = [aiContact, ...allProfiles];
    setContacts(finalContacts);
    
    // Auto select first contact
    if (finalContacts.length > 0) {
      setSelectedContact(finalContacts[0]);
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    const data = await getMessagesForUser(userId);
    if (data) {
      setMessages(data as Message[]);
    }
  };

  const fetchAiSuggestions = async (contact: Profile) => {
    if (contact.id === aiContactId) return;
    setLoadingSuggestions(true);
    try {
      const isBn = typeof window !== 'undefined' ? localStorage.getItem("study_buddy_lang") === "bn" : false;
      const filtered = messages
        .filter(m => (m.sender_id === contact.id && m.recipient_id === userId) || (m.sender_id === userId && m.recipient_id === contact.id))
        .slice(0, 5)
        .reverse();

      const historyFormatted = filtered.map(m => ({
        sender: m.sender_id === userId ? 'User' : 'Contact',
        content: m.content
      }));

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggestReplies",
          history: historyFormatted,
          userRole: role,
          contactRole: contact.role,
          language: isBn ? "bn" : "en"
        })
      });
      const data = await res.json();
      if (data && data.suggestions && Array.isArray(data.suggestions)) {
        setAiSuggestions(data.suggestions);
      } else {
        setAiSuggestions(isBn ? ["হ্যাঁ, আমি তৈরি!", "ধন্যবাদ!", "দারুণ হয়েছে!"] : ["Yes, I am ready!", "Thank you!", "That's awesome!"]);
      }
    } catch (e) {
      console.warn("Failed to fetch suggestions:", e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || newMessage).trim();
    if (!textToSend || !selectedContact || sending) return;
    
    setSending(true);
    if (!customText) setNewMessage("");
    
    // Play sound chime
    if (audioEnabled) {
      playMessageChime('sent');
    }

    try {
      if (selectedContact.id === aiContactId) {
        // Save user message locally
        const userMsg: Message = {
          id: `msg-${Date.now()}`,
          sender_id: userId,
          recipient_id: selectedContact.id,
          content: textToSend,
          message_type: 'notification',
          read: true,
          created_at: new Date().toISOString()
        };
        
        // Persist in localStorage/database helper
        if (typeof window !== 'undefined') {
          const msgs = localStorage.getItem('study_buddy_demo_messages');
          let messagesList: Message[] = [];
          if (msgs) {
            try { messagesList = JSON.parse(msgs); } catch (e) {}
          }
          messagesList.unshift(userMsg);
          localStorage.setItem('study_buddy_demo_messages', JSON.stringify(messagesList));
        }
        
        setMessages(prev => [userMsg, ...prev]);
        setIsTyping(true);
        scrollToBottom();

        // Query Gemini API Socratic Tutor
        const isBn = typeof window !== 'undefined' ? localStorage.getItem("study_buddy_lang") === "bn" : false;
        const currentFiltered = messages
          .filter(m => (m.sender_id === selectedContact.id && m.recipient_id === userId) || (m.sender_id === userId && m.recipient_id === selectedContact.id))
          .slice(0, 6)
          .reverse();
          
        const historyFormatted = currentFiltered.map(m => ({
          sender: m.sender_id === userId ? 'Student' : 'AI Companion',
          content: m.content
        }));

        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'chat',
            question: textToSend,
            history: historyFormatted,
            socraticPersona: role === 'student' ? 'Unicorn' : 'Professor Oak',
            language: isBn ? 'bn' : 'en'
          })
        });
        
        const data = await response.json();
        const aiResponseText = data.text || (isBn ? "আমি দুঃখিত, আমি এখন উত্তর দিতে পারছি না।" : "I'm sorry, I couldn't generate a response right now.");
        
        const aiMsg: Message = {
          id: `msg-ai-${Date.now()}`,
          sender_id: selectedContact.id,
          recipient_id: userId,
          content: aiResponseText,
          message_type: 'notification',
          read: false,
          created_at: new Date().toISOString()
        };
        
        // Persist AI reply
        if (typeof window !== 'undefined') {
          const msgs = localStorage.getItem('study_buddy_demo_messages');
          let messagesList: Message[] = [];
          if (msgs) {
            try { messagesList = JSON.parse(msgs); } catch (e) {}
          }
          messagesList.unshift(aiMsg);
          localStorage.setItem('study_buddy_demo_messages', JSON.stringify(messagesList));
        }
        
        setMessages(prev => [aiMsg, ...prev]);
        setIsTyping(false);
        if (audioEnabled) {
          playMessageChime('received');
        }
        scrollToBottom();

      } else if (!selectedContact.id.startsWith("mock-")) {
        // Real user database send
        await sendMessage(selectedContact.id, textToSend, 'notification');
        await loadMessages();
        scrollToBottom();

        // Standard dynamic acknowledgment
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const replyText = selectedContact.role === 'teacher' 
            ? `Hi! Thanks for the message. I will check on this and follow up with you shortly. 📚`
            : selectedContact.role === 'parent'
            ? `Hi there! Got your message. Let's align on study goals. 🌟`
            : `I received your message! I'm doing my lessons right now! 🚀`;
            
          const autoMsg: Message = {
            id: `msg-auto-${Date.now()}`,
            sender_id: selectedContact.id,
            recipient_id: userId,
            content: replyText,
            message_type: 'notification',
            read: false,
            created_at: new Date().toISOString()
          };
          setMessages(prev => [autoMsg, ...prev]);
          if (audioEnabled) {
            playMessageChime('received');
          }
          scrollToBottom();
        }, 1800);

      } else {
        // Mock user direct message send
        const userMsg: Message = {
          id: `msg-${Date.now()}`,
          sender_id: userId,
          recipient_id: selectedContact.id,
          content: textToSend,
          message_type: 'notification',
          read: true,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [userMsg, ...prev]);
        setIsTyping(true);
        scrollToBottom();

        setTimeout(() => {
          setIsTyping(false);
          const replyText = selectedContact.role === 'teacher' 
            ? `Hi! Thanks for reaching out. I'm actively monitoring your child's progress. Let's align on the latest lessons! 📚`
            : selectedContact.role === 'parent'
            ? `Hello! Thank you for the update. I am encouraging Alex to keep up the great study habits! 🌟`
            : `Hi there! I am currently studying the salokingleson (Photosynthesis) guide. It's super fun! 🧠✨`;

          const replyMsg: Message = {
            id: `msg-reply-${Date.now()}`,
            sender_id: selectedContact.id,
            recipient_id: userId,
            content: replyText,
            message_type: 'notification',
            read: false,
            created_at: new Date().toISOString()
          };
          setMessages(prev => [replyMsg, ...prev]);
          if (audioEnabled) {
            playMessageChime('received');
          }
          scrollToBottom();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(m => 
    (m.sender_id === selectedContact?.id && m.recipient_id === userId) ||
    (m.sender_id === userId && m.recipient_id === selectedContact?.id)
  ).slice().reverse(); // Oldest first for standard conversation flowing

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      <p className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">Synchronizing Inbox...</p>
    </div>
  );

  return (
    <div className="relative flex flex-col md:flex-row h-[650px] bg-[#0a0f1d] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* Real-time Push Notification Banner */}
      <AnimatePresence>
        {incomingNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={() => {
              const matchedContact = contacts.find(c => c.id === incomingNotification.senderId);
              if (matchedContact) {
                setSelectedContact(matchedContact);
              }
              setIncomingNotification(null);
            }}
            className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-indigo-900/90 hover:bg-indigo-900 border border-indigo-500/50 p-4 rounded-2xl shadow-2xl cursor-pointer backdrop-blur-md flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shrink-0 animate-bounce">
              <Bell className="w-5 h-5 text-indigo-100" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                New Message from <span className="text-indigo-200">{incomingNotification.senderName}</span>
              </h5>
              <p className="text-xs text-indigo-100/90 truncate mt-0.5 font-medium">{incomingNotification.content}</p>
              <span className="text-[10px] text-indigo-300 font-bold uppercase mt-1 block">Click to open chat 💬</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Sidebar */}
      <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-[#0a0f1d] shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-md flex items-center gap-2 text-white">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Direct Messages
            </h3>
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-xl border border-slate-800 transition-all ${audioEnabled ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-950 text-slate-500'}`}
              title={audioEnabled ? "Mute audio alerts" : "Enable audio alerts"}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people..." 
              className="w-full bg-[#060a12] border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredContacts.map(contact => {
            const isAi = contact.id === aiContactId;
            return (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedContact?.id === contact.id ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-slate-800/40 border border-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm relative shrink-0 ${isAi ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/20' : contact.role === 'teacher' ? 'bg-indigo-500/20 text-indigo-400' : contact.role === 'parent' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {isAi ? <Bot className="w-5 h-5" /> : contact.name.charAt(0)}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a0f1d] rounded-full" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-200 truncate flex items-center gap-1">
                    {contact.name}
                    {isAi && <Sparkles className="w-3 h-3 text-purple-400 fill-purple-400" />}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{isAi ? 'AI COMPANION' : contact.role}</p>
                </div>
                {selectedContact?.id === contact.id && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#060a12]/50 relative">
        {selectedContact ? (
          <>
            {/* Active Contact Header */}
            <div className="p-4 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm ${selectedContact.id === aiContactId ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-md' : selectedContact.role === 'teacher' ? 'bg-indigo-500/20 text-indigo-400' : selectedContact.role === 'parent' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {selectedContact.id === aiContactId ? <Bot className="w-5 h-5" /> : selectedContact.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1">
                    {selectedContact.name}
                    {selectedContact.id === aiContactId && <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />}
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Online Now
                  </p>
                </div>
              </div>
              <div className="text-[11px] font-bold text-slate-500 border border-slate-800 bg-[#060a12] px-3 py-1.5 rounded-full uppercase tracking-widest">
                {selectedContact.id === aiContactId ? 'Socratic Engine' : 'Encrypted direct chat'}
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((m) => {
                  const isOwn = m.sender_id === userId;
                  return (
                    <div 
                      key={m.id} 
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg transition-all ${
                        isOwn 
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-indigo-500/5' 
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-black/40'
                      }`}>
                        <div className="whitespace-pre-wrap">{m.content}</div>
                        <div className={`text-[10px] mt-2 flex items-center justify-between gap-2 ${isOwn ? 'text-indigo-200' : 'text-slate-500 font-mono'}`}>
                          <span>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            <span className="flex items-center gap-0.5">
                              {m.read ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Check className="w-3.5 h-3.5 text-indigo-300" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center bg-[#0a0f1d] shadow-inner text-indigo-500">
                    <MessageSquare className="w-6 h-6 opacity-40 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">No messages yet. Start the conversation!</p>
                  <p className="text-xs text-slate-600 max-w-xs text-center">Your messages are persistent and linked using secure UID profiles.</p>
                </div>
              )}

              {/* Realistic Typing Indicator Animation */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-bl-none flex items-center space-x-2 shadow-lg">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Smart Suggested Replies Panel */}
            {selectedContact.id !== aiContactId && aiSuggestions.length > 0 && (
              <div className="px-6 py-2 bg-[#0a0f1d]/30 border-t border-slate-800 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-extrabold uppercase tracking-widest mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Smart Suggested Replies
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(suggestion)}
                      className="bg-indigo-500/10 hover:bg-indigo-500/20 active:scale-95 border border-indigo-500/20 text-indigo-300 font-bold text-xs py-2 px-4 rounded-full transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Suggestion Loading state */}
            {selectedContact.id !== aiContactId && loadingSuggestions && (
              <div className="px-6 py-2 bg-[#0a0f1d]/30 border-t border-slate-800 flex items-center gap-2 shrink-0">
                <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Consulting Gemini for smart response ideas...</span>
              </div>
            )}

            {/* Message Input Box */}
            <div className="p-6 border-t border-slate-800 bg-[#0a0f1d] shrink-0">
              <div className="flex gap-3">
                <input 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
                  className="flex-1 bg-[#060a12] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                  placeholder={
                    selectedContact.id === aiContactId 
                      ? `Ask ${selectedContact.name} anything about your homework...` 
                      : `Message ${selectedContact.name}...`
                  }
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={sending || !newMessage.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-30 disabled:pointer-events-none text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <Users className="w-16 h-16 opacity-10 mb-4" />
            <h4 className="text-lg font-bold text-slate-300">Select a contact</h4>
            <p className="text-sm max-w-xs">Choose someone from the left to start a secure interconnected conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};
