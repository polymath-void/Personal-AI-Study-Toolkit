import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabase } from '../supabase';
import type { ChatRoom, ChatMessage, Profile } from '../../types';

// Helper to determine if we are in demo/offline mode
const isDemoSession = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('study_buddy_demo_user') !== null || !process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
  return true;
};

// Local storage keys for demo fallback
const DEMO_ROOMS_KEY = 'sb_demo_chat_rooms';
const DEMO_MESSAGES_KEY = 'sb_demo_chat_messages';

export const useRealtimeChat = (currentUserId: string, currentRole: string) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [contacts, setContacts] = useState<Profile[]>([]);

  // Prevent multiple simultaneous pagination fetches
  const isFetchingMore = useRef(false);
  // Keep track of the oldest message timestamp for cursor-based pagination
  const oldestMessageCursor = useRef<string | null>(null);
  // Store the active channel refs
  const messagesChannelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);

  // Helper to get parent_global_uid if logged in as custom sub-user
  const getParentGlobalUid = useCallback((): string => {
    if (currentRole === 'parent') return currentUserId;
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('sub_user_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.parent_global_uid) return parsed.parent_global_uid;
        } catch (e) {}
      }
    }
    return currentUserId; // Fallback
  }, [currentUserId, currentRole]);

  // Load list of possible direct message contacts based on roles and parent_global_uid
  const loadContacts = useCallback(async () => {
    if (isDemoSession()) {
      const mockContacts: Profile[] = [
        {
          id: 'teacher-demo-id',
          name: 'Prof. Sarah Vance (Educator)',
          email: 'sarah@demo.com',
          role: 'teacher',
          created_at: new Date().toISOString()
        },
        {
          id: 'parent-demo-id',
          name: 'Mr. Robert Smith (Parent)',
          email: 'robert@demo.com',
          role: 'parent',
          created_at: new Date().toISOString()
        },
        {
          id: 'student-demo-id',
          name: 'Alex Smith (Student)',
          email: 'alex@demo.com',
          role: 'student',
          created_at: new Date().toISOString()
        }
      ];
      setContacts(mockContacts.filter(c => c.id !== currentUserId));
      return;
    }

    try {
      const supabase = getSupabase();
      const parentGlobalUid = getParentGlobalUid();

      // Retrieve all sub-users and parent linked to this ecosystem
      const { data: subUsers, error: subUsersError } = await supabase
        .from('sub_users')
        .select('sub_uid, name, role')
        .eq('parent_global_uid', parentGlobalUid);

      const { data: parentProfile, error: parentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', parentGlobalUid)
        .single();

      if (subUsersError) throw subUsersError;

      const results: Profile[] = [];
      if (parentProfile && parentProfile.id !== currentUserId) {
        results.push(parentProfile as Profile);
      }

      if (subUsers) {
        subUsers.forEach((u: any) => {
          if (u.sub_uid !== currentUserId) {
            results.push({
              id: u.sub_uid,
              name: u.name,
              role: u.role === 'kid' ? 'student' : 'teacher',
              email: `${u.sub_uid}@subuser.local`,
              created_at: new Date().toISOString()
            });
          }
        });
      }

      setContacts(results);
    } catch (e) {
      console.warn('Failed to load real-time chat contacts, using fallback.', e);
    }
  }, [currentUserId, getParentGlobalUid]);

  // Load chat threads (rooms)
  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    if (isDemoSession()) {
      const stored = localStorage.getItem(DEMO_ROOMS_KEY);
      if (stored) {
        setRooms(JSON.parse(stored));
      } else {
        const defaultRooms: ChatRoom[] = [
          {
            id: 'demo-room-1',
            is_group: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            unread_count: 0,
            last_message: 'Welcome to your Study Kit workspace! 🌱',
            last_message_at: new Date().toISOString(),
            participants: [
              {
                id: 'teacher-demo-id',
                name: 'Prof. Sarah Vance (Educator)',
                email: 'sarah@demo.com',
                role: 'teacher',
                created_at: new Date().toISOString()
              },
              {
                id: 'student-demo-id',
                name: 'Alex Smith (Student)',
                email: 'alex@demo.com',
                role: 'student',
                created_at: new Date().toISOString()
              }
            ]
          }
        ];
        localStorage.setItem(DEMO_ROOMS_KEY, JSON.stringify(defaultRooms));
        setRooms(defaultRooms);
      }
      setLoadingRooms(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const parentGlobalUid = getParentGlobalUid();

      // Ensure DB session configuration is set up for custom sub-user RLS context
      if (currentRole !== 'parent') {
        await supabase.rpc('set_sub_user_session', { 
          p_sub_uid: currentUserId, 
          p_pin: '123456' // RPC session config initialization bypass
        }).catch(() => {});
      }

      // Step 1: Query chat_threads belonging to this parent ecosystem/tenant
      let threadsQuery = supabase
        .from('chat_threads')
        .select('*');

      if (currentRole === 'parent') {
        threadsQuery = threadsQuery.eq('parent_global_uid', currentUserId);
      } else {
        threadsQuery = threadsQuery.or(`participant_one_uid.eq.${currentUserId},participant_two_uid.eq.${currentUserId}`);
      }

      const { data: threads, error: threadsErr } = await threadsQuery;
      if (threadsErr || !threads) throw threadsErr;

      // Step 2: Resolve participant profiles
      const uids = new Set<string>();
      (threads as any[]).forEach((t: any) => {
        uids.add(t.parent_global_uid);
        uids.add(t.participant_one_uid);
        uids.add(t.participant_two_uid);
      });
      const uidsArray = Array.from(uids);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uidsArray);

      const profileMap = new Map<string, Profile>();
      if (profiles) {
        profiles.forEach((p: Profile) => profileMap.set(p.id, p));
      }

      // Step 3: Fetch last messages for each thread
      const { data: lastMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .in('thread_id', (threads as any[]).map((t: any) => t.thread_id))
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      const mappedRooms: ChatRoom[] = (threads as any[]).map((t: any) => {
        const p1 = profileMap.get(t.participant_one_uid) || {
          id: t.participant_one_uid,
          name: 'Sub-User',
          role: 'student',
          email: '',
          created_at: ''
        };
        const p2 = profileMap.get(t.participant_two_uid) || {
          id: t.participant_two_uid,
          name: 'Sub-User',
          role: 'student',
          email: '',
          created_at: ''
        };

        const roomLastMsg = lastMessages?.find((m: any) => m.thread_id === t.thread_id);

        return {
          id: t.thread_id,
          name: t.thread_type.replace('_', ' ').toUpperCase(),
          is_group: false,
          created_at: t.created_at,
          updated_at: roomLastMsg?.created_at || t.created_at,
          unread_count: 0,
          last_message: roomLastMsg?.content || 'No messages yet.',
          last_message_at: roomLastMsg?.created_at || t.created_at,
          participants: [p1, p2],
          thread_id: t.thread_id,
          parent_global_uid: t.parent_global_uid,
          participant_one_uid: t.participant_one_uid,
          participant_two_uid: t.participant_two_uid,
          thread_type: t.thread_type
        };
      });

      // Sort by last message activity
      mappedRooms.sort((a, b) => new Date(b.last_message_at || '').getTime() - new Date(a.last_message_at || '').getTime());
      setRooms(mappedRooms);
    } catch (e) {
      console.error('Failed to load threads:', e);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, [currentUserId, currentRole, getParentGlobalUid]);

  // Create a new chat thread
  const createRoom = async (targetUserId: string, targetName?: string, isGroup = false): Promise<string | null> => {
    if (isDemoSession()) {
      const storedRooms = localStorage.getItem(DEMO_ROOMS_KEY);
      const list: ChatRoom[] = storedRooms ? JSON.parse(storedRooms) : [];
      const existing = list.find(r => r.participants?.some(p => p.id === targetUserId));
      if (existing) return existing.id;

      const targetContact = contacts.find(c => c.id === targetUserId);
      const myProfile: Profile = {
        id: currentUserId,
        name: 'You',
        role: currentRole as any,
        email: 'you@demo.com',
        created_at: new Date().toISOString()
      };

      const newRoomId = `demo-room-${Date.now()}`;
      const newRoom: ChatRoom = {
        id: newRoomId,
        is_group: false,
        name: targetName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 0,
        last_message: 'Room created.',
        last_message_at: new Date().toISOString(),
        participants: targetContact ? [myProfile, targetContact] : [myProfile]
      };

      const updated = [newRoom, ...list];
      localStorage.setItem(DEMO_ROOMS_KEY, JSON.stringify(updated));
      setRooms(updated);
      return newRoomId;
    }

    try {
      const supabase = getSupabase();
      const parentGlobalUid = getParentGlobalUid();

      // Check if thread already exists
      const { data: existingThread } = await supabase
        .from('chat_threads')
        .select('thread_id')
        .or(`and(participant_one_uid.eq.${currentUserId},participant_two_uid.eq.${targetUserId}),and(participant_one_uid.eq.${targetUserId},participant_two_uid.eq.${currentUserId})`)
        .maybeSingle();

      if (existingThread) {
        return existingThread.thread_id;
      }

      // Determine thread type
      let threadType: 'parent_teacher' | 'parent_kid' | 'teacher_kid' = 'parent_kid';
      const myRole = currentRole === 'student' ? 'kid' : currentRole;
      const targetContact = contacts.find(c => c.id === targetUserId);
      const targetRole = targetContact?.role === 'student' ? 'kid' : targetContact?.role;

      if ((myRole === 'parent' && targetRole === 'teacher') || (myRole === 'teacher' && targetRole === 'parent')) {
        threadType = 'parent_teacher';
      } else if ((myRole === 'parent' && targetRole === 'kid') || (myRole === 'kid' && targetRole === 'parent')) {
        threadType = 'parent_kid';
      } else {
        threadType = 'teacher_kid';
      }

      const { data: newThread, error: insertErr } = await supabase
        .from('chat_threads')
        .insert({
          parent_global_uid: parentGlobalUid,
          participant_one_uid: currentUserId,
          participant_two_uid: targetUserId,
          thread_type: threadType
        })
        .select()
        .single();

      if (insertErr || !newThread) throw insertErr;

      await loadRooms();
      return newThread.thread_id;
    } catch (e) {
      console.error('Failed to create thread:', e);
      return null;
    }
  };

  // Fetch paginated messages
  const fetchMessages = useCallback(async (roomId: string, loadMore = false) => {
    if (isFetchingMore.current) return;
    isFetchingMore.current = true;
    setLoadingMessages(!loadMore);

    if (isDemoSession()) {
      const stored = localStorage.getItem(DEMO_MESSAGES_KEY);
      let list: ChatMessage[] = stored ? JSON.parse(stored) : [];
      let filtered = list.filter(m => m.room_id === roomId);

      if (filtered.length === 0) {
        const defaultMsgs: ChatMessage[] = [
          {
            id: `demo-msg-1`,
            room_id: roomId,
            sender_id: 'teacher-demo-id',
            content: 'Hello! Welcome to Smart Parenting Chat ecosystem. 🌟 Let me know if you need any study guides.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        list = [...defaultMsgs, ...list];
        localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(list));
        filtered = defaultMsgs;
      }

      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMessages(filtered);
      setHasMore(false);
      setLoadingMessages(false);
      isFetchingMore.current = false;
      return;
    }

    try {
      const supabase = getSupabase();
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', roomId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(25);

      if (loadMore && oldestMessageCursor.current) {
        query = query.lt('created_at', oldestMessageCursor.current);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles to map sender details
      const senderUids = Array.from(new Set((data || []).map((m: any) => m.sender_uid)));
      const { data: senders } = await supabase
        .from('profiles')
        .select('*')
        .in('id', senderUids);

      const senderMap = new Map<string, Profile>();
      if (senders) {
        senders.forEach((s: Profile) => senderMap.set(s.id, s));
      }

      const formatted: ChatMessage[] = (data || []).map((m: any) => ({
        id: m.message_id,
        room_id: m.thread_id,
        sender_id: m.sender_uid,
        content: m.content,
        created_at: m.created_at,
        updated_at: m.created_at,
        status: 'sent',
        sender: senderMap.get(m.sender_uid)
      }));

      if (formatted.length > 0) {
        oldestMessageCursor.current = formatted[formatted.length - 1].created_at;
        if (loadMore) {
          setMessages(prev => [...prev, ...formatted]);
        } else {
          setMessages(formatted);
        }
        setHasMore(formatted.length === 25);
      } else {
        setHasMore(false);
        if (!loadMore) setMessages([]);
      }
    } catch (e) {
      console.error('Error fetching chat messages:', e);
    } finally {
      setLoadingMessages(false);
      isFetchingMore.current = false;
    }
  }, []);

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeRoomId) return;

    const tempId = `temp-msg-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      room_id: activeRoomId,
      sender_id: currentUserId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [optimisticMessage, ...prev]);

    setRooms(prev => prev.map(r => r.id === activeRoomId ? {
      ...r,
      last_message: content.trim(),
      last_message_at: optimisticMessage.created_at
    } : r));

    if (isDemoSession()) {
      const stored = localStorage.getItem(DEMO_MESSAGES_KEY);
      const list: ChatMessage[] = stored ? JSON.parse(stored) : [];
      const realMessage: ChatMessage = {
        ...optimisticMessage,
        id: `demo-msg-${Date.now()}`,
        status: 'sent'
      };
      list.unshift(realMessage);
      localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(list));

      setMessages(prev => prev.map(m => m.id === tempId ? realMessage : m));
      return;
    }

    try {
      const supabase = getSupabase();
      const parentGlobalUid = getParentGlobalUid();

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          thread_id: activeRoomId,
          parent_global_uid: parentGlobalUid,
          sender_uid: currentUserId,
          content: content.trim()
        })
        .select()
        .single();

      if (error || !data) throw error;

      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      const confirmed: ChatMessage = {
        id: data.message_id,
        room_id: data.thread_id,
        sender_id: data.sender_uid,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.created_at,
        status: 'sent',
        sender: senderProfile as Profile || undefined
      };

      setMessages(prev => prev.map(m => m.id === tempId ? confirmed : m));
    } catch (e) {
      console.error('Failed to send message:', e);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
    }
  };

  // Soft delete message
  const softDeleteMessage = async (messageId: string) => {
    if (isDemoSession()) {
      const stored = localStorage.getItem(DEMO_MESSAGES_KEY);
      if (stored) {
        const list: ChatMessage[] = JSON.parse(stored);
        const updated = list.filter(m => m.id !== messageId);
        localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(updated));
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('chat_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('message_id', messageId);

      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (e) {
      console.error('Failed to soft delete message:', e);
    }
  };

  // Subscribe to WebSocket modifications
  useEffect(() => {
    loadContacts();
    loadRooms();
  }, [loadContacts, loadRooms]);

  // Subscription specific to Active Thread ID
  useEffect(() => {
    if (!activeRoomId) {
      setMessages([]);
      return;
    }

    oldestMessageCursor.current = null;
    setHasMore(true);

    fetchMessages(activeRoomId);

    if (isDemoSession()) return;

    const supabase = getSupabase();

    const msgChannel = supabase
      .channel(`chat-thread-messages-${activeRoomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${activeRoomId}`
        },
        async (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new;
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.message_id)) return prev;
              const filtered = prev.filter(m => m.content !== newMsg.content || m.sender_id !== newMsg.sender_uid || m.status !== 'sending');

              const chatMsg: ChatMessage = {
                id: newMsg.message_id,
                room_id: newMsg.thread_id,
                sender_id: newMsg.sender_uid,
                content: newMsg.content,
                created_at: newMsg.created_at,
                updated_at: newMsg.created_at,
                status: 'sent'
              };

              const contactProfile = contacts.find(c => c.id === newMsg.sender_uid);
              if (contactProfile) chatMsg.sender = contactProfile;

              return [chatMsg, ...filtered];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new;
            if (updatedMsg.deleted_at) {
              setMessages(prev => prev.filter(m => m.id !== updatedMsg.message_id));
            } else {
              setMessages(prev => prev.map(m => m.id === updatedMsg.message_id ? {
                ...m,
                content: updatedMsg.content
              } : m));
            }
          }
        }
      )
      .subscribe();

    messagesChannelRef.current = msgChannel;

    return () => {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
      }
    };
  }, [activeRoomId, fetchMessages, contacts, getParentGlobalUid]);

  return {
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
    fetchMoreMessages: () => activeRoomId && fetchMessages(activeRoomId, true),
    sendMessage,
    softDeleteMessage,
    sendTypingStatus: (isTyping: boolean) => {}, // Typing statuses bypassed for thread simplicity
    createRoom,
    refreshRooms: loadRooms
  };
};
