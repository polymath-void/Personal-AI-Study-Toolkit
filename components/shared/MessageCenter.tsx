import React, { useState, useEffect, useRef } from "react";
import { useRealtimeChat } from "../../lib/hooks/useRealtimeChat";
import type { ChatRoom, ChatMessage, Profile } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Users, MessageSquare, Search, Loader2, 
  Trash2, Plus, Volume2, VolumeX, Check, CheckCheck, Circle, AlertCircle 
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
    
    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.warn("Audio chime failed to initialize", e);
  }
};

interface MessageCenterProps {
  role: 'teacher' | 'parent' | 'student';
  userId: string;
}

export const MessageCenter = ({ role, userId }: MessageCenterProps) => {
  const {
    rooms,
    activeRoomId,
    setActiveRoomId,
    messages,
    hasMore,
    loadingRooms,
    loadingMessages,
    onlineUsers,
    typingUsers,
    contacts,
    fetchMoreMessages,
    sendMessage,
    softDeleteMessage,
    sendTypingStatus,
    createRoom
  } = useRealtimeChat(userId, role);

  const [newMessageText, setNewMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showNewChatList, setShowNewChatList] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom of chat list on initial active room changes or when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [activeRoomId, messages.length]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Play chimes on incoming / outgoing message events
  const prevMessagesLengthRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const newestMsg = messages[0];
      if (newestMsg) {
        if (newestMsg.sender_id === userId) {
          if (audioEnabled) playMessageChime('sent');
        } else {
          if (audioEnabled) playMessageChime('received');
        }
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, userId, audioEnabled]);

  // Debounced typing indicator handler
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewMessageText(text);
    
    // Broadcast typing state to presence channel
    sendTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 1500);
  };

  const handleSend = async () => {
    if (!newMessageText.trim() || !activeRoomId) return;
    const text = newMessageText.trim();
    setNewMessageText("");
    sendTypingStatus(false);
    await sendMessage(text);
  };

  const handleCreateDirectChat = async (targetUserId: string, targetName: string) => {
    setShowNewChatList(false);
    const roomId = await createRoom(targetUserId, targetName, false);
    if (roomId) {
      setActiveRoomId(roomId);
    }
  };

  // Find recipient participant name for active 1:1 room
  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const recipientUser = activeRoom?.participants?.find(p => p.id !== userId);

  // Filter contacts by name/role query
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter existing rooms by query
  const filteredRooms = rooms.filter(r => {
    const matchName = r.is_group 
      ? r.name?.toLowerCase().includes(searchQuery.toLowerCase())
      : r.participants?.some(p => p.id !== userId && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchName;
  });

  if (loadingRooms) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">Synchronizing Encrypted Feed...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col md:flex-row h-[620px] bg-[#090f1a] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300">
      
      {/* Sidebar panel */}
      <div className="w-full md:w-80 border-r border-slate-200 dark:border-white/5 flex flex-col bg-[#090f1a] shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/5 bg-[#090f1a]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Direct Conversations
            </h3>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-1.5 rounded-lg border transition-all ${audioEnabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-900/50 text-slate-500 border-slate-200 dark:border-white/5'}`}
                title={audioEnabled ? "Mute alert chimes" : "Unmute alert chimes"}
              >
                {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              
              <button 
                onClick={() => setShowNewChatList(!showNewChatList)}
                className={`p-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95 ${showNewChatList ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}
                title="Start custom chat room"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat list..." 
              className="w-full bg-slate-100 dark:bg-[#060a12] border border-slate-200 dark:border-white/5 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-400 font-sans"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#090f1a]">
          <AnimatePresence mode="popLayout">
            {showNewChatList ? (
              // NEW CHAT CONTACT SELECTION LIST
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-1.5"
              >
                <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-black px-2 mb-2">
                  Select Permitted User:
                </div>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => handleCreateDirectChat(contact.id, contact.name)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-emerald-500/10 hover:border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${contact.role === 'teacher' ? 'bg-indigo-500/10 text-indigo-400' : contact.role === 'parent' ? 'bg-pink-500/10 text-pink-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{contact.name}</p>
                        <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{contact.role}</p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black">CHAT</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 font-medium">
                    No directory contacts found.
                  </div>
                )}
                <button 
                  onClick={() => setShowNewChatList(false)}
                  className="w-full py-1.5 text-center font-bold text-[10px] text-slate-400 hover:text-slate-200 uppercase tracking-widest bg-slate-900/10 dark:bg-slate-900/30 rounded-xl"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              // ACTIVE CHAT ROOMS LIST
              filteredRooms.map(room => {
                const isActive = room.id === activeRoomId;
                const dmRecipient = room.participants?.find(p => p.id !== userId);
                const displayName = (room.is_group ? room.name : (dmRecipient?.name || "Direct Message")) || "Group Chat";
                const displayRole = room.is_group ? "Group Room" : (dmRecipient?.role || "user");
                const isRecipientOnline = dmRecipient ? onlineUsers[dmRecipient.id] : false;

                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${isActive ? 'bg-emerald-500/10 border-emerald-500/20 shadow-md shadow-emerald-500/5' : 'hover:bg-slate-800/10 dark:hover:bg-slate-800/20 border-transparent'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs relative shrink-0 ${room.is_group ? 'bg-emerald-500/20 text-emerald-500' : displayRole === 'teacher' ? 'bg-indigo-500/20 text-indigo-400' : displayRole === 'parent' ? 'bg-pink-500/20 text-pink-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {displayName.charAt(0)}
                      {!room.is_group && isRecipientOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#090f1a] rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{displayName}</p>
                        {room.unread_count && room.unread_count > 0 ? (
                          <span className="bg-emerald-500 text-white font-mono font-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full shrink-0">
                            {room.unread_count}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{room.last_message}</p>
                    </div>
                  </button>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main chat window area */}
      <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-[#060a12]/30 relative">
        {activeRoom ? (
          <>
            {/* Active Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#090f1a] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${activeRoom.is_group ? 'bg-emerald-500/20 text-emerald-500' : recipientUser?.role === 'teacher' ? 'bg-indigo-500/20 text-indigo-400' : recipientUser?.role === 'parent' ? 'bg-pink-500/20 text-pink-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {(recipientUser?.name || "C").charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                    {activeRoom.is_group ? activeRoom.name : recipientUser?.name}
                  </h4>
                  {recipientUser && onlineUsers[recipientUser.id] ? (
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      Active Now
                    </p>
                  ) : (
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                      Offline
                    </p>
                  )}
                </div>
              </div>
              <div className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060a12] px-3 py-1 rounded-full uppercase tracking-widest">
                Realtime Node Link
              </div>
            </div>

            {/* Pagination Load Trigger & Messages Feed */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-5 space-y-3 flex flex-col-reverse"
            >
              {/* Ref point for auto-scroll */}
              <div ref={messagesEndRef} />

              {/* Realistic typing indicators inside the flow */}
              {recipientUser && typingUsers[recipientUser.id] && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-2xl rounded-bl-none flex items-center space-x-1.5 shadow-sm">
                    <span className="text-[10px] text-slate-500 mr-1">{recipientUser.name.split(' ')[0]} typing</span>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Message list renderer */}
              {messages.length > 0 ? (
                messages.map((m) => {
                  const isOwn = m.sender_id === userId;
                  return (
                    <div 
                      key={m.id} 
                      className={`flex group ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[75%]">
                        {isOwn && (
                          <button 
                            onClick={() => softDeleteMessage(m.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 bg-slate-200/50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 transition-all self-center mr-1"
                            title="Soft-delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md relative ${
                          isOwn 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-bl-none'
                        }`}>
                          <div className="whitespace-pre-wrap">{m.content}</div>
                          <div className={`text-[9px] mt-1.5 flex items-center justify-between gap-2 ${isOwn ? 'text-emerald-200' : 'text-slate-500 font-mono'}`}>
                            <span>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            {isOwn && (
                              <span className="flex items-center gap-0.5">
                                {m.status === 'sending' ? (
                                  <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-100" />
                                ) : m.status === 'failed' ? (
                                  <span title="Sending failed">
                                    <AlertCircle className="w-2.5 h-2.5 text-rose-300" />
                                  </span>
                                ) : (
                                  <CheckCheck className="w-3 h-3 text-emerald-200" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 mt-20">
                  <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-[#090f1a] shadow-inner text-emerald-500">
                    <MessageSquare className="w-5 h-5 opacity-40 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No message logs yet</p>
                  <p className="text-[10px] text-slate-400 max-w-xs text-center font-sans">Start typing to launch a secured, high-performance realtime bridge.</p>
                </div>
              )}

              {/* Cursor scroll trigger loader */}
              {hasMore && (
                <div className="flex justify-center py-2 shrink-0">
                  <button 
                    onClick={fetchMoreMessages}
                    disabled={loadingMessages}
                    className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-bold text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-all"
                  >
                    {loadingMessages ? (
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                    ) : (
                      "Load Older Messages"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Message Input panel */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#090f1a] shrink-0">
              <div className="flex gap-2">
                <input 
                  value={newMessageText} 
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
                  className="flex-1 bg-slate-100 dark:bg-[#060a12] border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all font-sans"
                  placeholder={`Message ${activeRoom.is_group ? activeRoom.name : recipientUser?.name || "user"}...`}
                />
                <button 
                  onClick={handleSend}
                  disabled={!newMessageText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-100/10 dark:bg-[#060a12]/20">
            <Users className="w-12 h-12 opacity-10 mb-3 text-slate-400" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">Select a Conversation</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">Choose someone from the left sidebar or click the plus button to establish a direct channel.</p>
          </div>
        )}
      </div>
    </div>
  );
};
