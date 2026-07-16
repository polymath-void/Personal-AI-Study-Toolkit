import { getSupabase } from './supabase';
import type { Profile, Message, MasteryStat, ParentChildLink, StudentWithStats } from '../types';

// Demo helper functions to identify and manage local mock sessions
function isDemoSession(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('study_buddy_demo_user') !== null;
  }
  return false;
}

function getDemoUser(): Profile | null {
  if (typeof window !== 'undefined') {
    const u = localStorage.getItem('study_buddy_demo_user');
    if (u) {
      try {
        return JSON.parse(u);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

// Key names for demo local storage persistence
const DEMO_MESSAGES_KEY = 'study_buddy_demo_messages';
const DEMO_MASTERY_KEY = 'study_buddy_demo_mastery';

function getDemoMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  const msgs = localStorage.getItem(DEMO_MESSAGES_KEY);
  if (msgs) {
    try {
      return JSON.parse(msgs);
    } catch (e) {}
  }
  // Default seeded messages for demo workspaces
  const defaultMsgs: Message[] = [
    {
      id: 'demo-msg-1',
      sender_id: 'teacher-demo-id',
      recipient_id: 'student-demo-id',
      content: 'Hey! Great job on your mind map lesson today! 🌟 Keep it up!',
      message_type: 'notification',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'demo-msg-2',
      sender_id: 'parent-demo-id',
      recipient_id: 'student-demo-id',
      content: 'Please finish the Photosynthesis lesson before playtime! 🥞',
      message_type: 'hint',
      read: false,
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ];
  localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(defaultMsgs));
  return defaultMsgs;
}

function saveDemoMessages(messages: Message[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(messages));
  }
}

function getDemoMasteryStats(): MasteryStat[] {
  if (typeof window === 'undefined') return [];
  const stats = localStorage.getItem(DEMO_MASTERY_KEY);
  if (stats) {
    try {
      return JSON.parse(stats);
    } catch (e) {}
  }
  // Default seeded stats for interactive recall scoring
  const defaultStats: MasteryStat[] = [
    {
      id: 'demo-stat-1',
      student_id: 'student-demo-id',
      subject: 'Photosynthesis',
      score: 85,
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-stat-2',
      student_id: 'student-demo-id',
      subject: 'Fraction Division',
      score: 92,
      updated_at: new Date().toISOString()
    }
  ];
  localStorage.setItem(DEMO_MASTERY_KEY, JSON.stringify(defaultStats));
  return defaultStats;
}

function saveDemoMasteryStats(stats: MasteryStat[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEMO_MASTERY_KEY, JSON.stringify(stats));
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (isDemoSession()) {
    return getDemoUser();
  }
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('getCurrentProfile error:', error.message);
      return null;
    }
    return data as Profile;
  } catch (e) {
    return null;
  }
}

export async function sendMessage(
  recipientId: string,
  content: string,
  messageType: Message['message_type']
): Promise<Message | null> {
  if (isDemoSession()) {
    const demoUser = getDemoUser();
    if (!demoUser) return null;
    const messages = getDemoMessages();
    const newMsg: Message = {
      id: `demo-msg-${Date.now()}`,
      sender_id: demoUser.id,
      recipient_id: recipientId,
      content,
      message_type: messageType,
      read: false,
      created_at: new Date().toISOString()
    };
    messages.unshift(newMsg);
    saveDemoMessages(messages);
    return newMsg;
  }
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      content,
      message_type: messageType,
      read: false,
    })
    .select()
    .single();

  if (error) {
    console.error('sendMessage error:', error.message);
    return null;
  }
  return data as Message;
}

export async function getMessagesForUser(userId: string): Promise<Message[]> {
  if (isDemoSession()) {
    const messages = getDemoMessages();
    return messages.filter(m => m.recipient_id === userId || m.sender_id === userId);
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`recipient_id.eq.${userId},sender_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getMessagesForUser error:', error.message);
    return [];
  }
  return data as Message[];
}

export async function updateMasteryStat(
  studentId: string,
  subject: string,
  score: number
): Promise<MasteryStat | null> {
  if (isDemoSession()) {
    const stats = getDemoMasteryStats();
    const existingIndex = stats.findIndex(s => s.student_id === studentId && s.subject.toLowerCase() === subject.toLowerCase());
    if (existingIndex !== -1) {
      stats[existingIndex].score = score;
      stats[existingIndex].updated_at = new Date().toISOString();
      saveDemoMasteryStats(stats);
      return stats[existingIndex];
    } else {
      const newStat: MasteryStat = {
        id: `demo-stat-${Date.now()}`,
        student_id: studentId,
        subject,
        score,
        updated_at: new Date().toISOString()
      };
      stats.push(newStat);
      saveDemoMasteryStats(stats);
      return newStat;
    }
  }
  const supabase = getSupabase();
  
  // Try to find existing stat for this subject
  const { data: existing, error: findError } = await supabase
    .from('mastery_stats')
    .select('*')
    .eq('student_id', studentId)
    .eq('subject', subject)
    .maybeSingle();

  if (findError) {
    console.error('updateMasteryStat find error:', findError.message);
    return null;
  }

  if (existing) {
    const { data, error } = await supabase
      .from('mastery_stats')
      .update({ score, updated_at: new Date().toISOString() })
      .eq('id', (existing as MasteryStat).id)
      .select()
      .single();
    
    if (error) {
      console.error('updateMasteryStat update error:', error.message);
      return null;
    }
    return data as MasteryStat;
  } else {
    const { data, error } = await supabase
      .from('mastery_stats')
      .insert({
        student_id: studentId,
        subject,
        score,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('updateMasteryStat insert error:', error.message);
      return null;
    }
    return data as MasteryStat;
  }
}

export async function updateStudentActiveGuide(
  studentId: string,
  guideTitle: string
): Promise<void> {
  if (isDemoSession()) {
    const demoUser = getDemoUser();
    if (demoUser && demoUser.id === studentId) {
      demoUser.current_activity = guideTitle;
      demoUser.last_active_at = new Date().toISOString();
      localStorage.setItem('study_buddy_demo_user', JSON.stringify(demoUser));
    }
    return;
  }
  const supabase = getSupabase();
  await supabase
    .from('profiles')
    .update({ 
      current_activity: guideTitle,
      last_active_at: new Date().toISOString() 
    })
    .eq('id', studentId);
}

export async function createStudyResource(resource: {
  title: string;
  type: string;
  status: string;
  teacher_id: string;
}): Promise<any> {
  if (isDemoSession()) {
    const demoResourcesStr = localStorage.getItem('study_buddy_demo_resources') || '[]';
    const resources = JSON.parse(demoResourcesStr);
    const newRes = {
      ...resource,
      id: `demo-res-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    resources.push(newRes);
    localStorage.setItem('study_buddy_demo_resources', JSON.stringify(resources));
    return newRes;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('study_resources')
    .insert({ ...resource, date: new Date().toISOString().split('T')[0] })
    .select()
    .single();
    
  if (error) console.error('Resource creation error:', error.message);
  return data;
}

export async function getStudentsForParent(parentId: string): Promise<StudentWithStats[]> {
  if (isDemoSession()) {
    const studentProfile: Profile = {
      id: 'student-demo-id',
      email: 'student@demo.com',
      name: 'Demo Student',
      role: 'student',
      is_premium: true,
      current_activity: 'Feynman Photosynthesis 🌱',
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    const stats = getDemoMasteryStats();
    return [{
      ...studentProfile,
      stats: stats.filter(s => s.student_id === 'student-demo-id')
    }];
  }
  const supabase = getSupabase();
  const { data: links, error: linkError } = await supabase
    .from('parent_child_links')
    .select('student_id')
    .eq('parent_id', parentId);

  if (linkError || !links || links.length === 0) {
    if (linkError) console.error('getStudentsForParent link error:', linkError.message);
    return [];
  }

  const studentIds = links.map((l: { student_id: string }) => l.student_id);

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', studentIds);

  if (profileError || !profiles) {
    console.error('getStudentsForParent profile error:', profileError?.message);
    return [];
  }

  const { data: stats, error: statsError } = await supabase
    .from('mastery_stats')
    .select('*')
    .in('student_id', studentIds);

  if (statsError) {
    console.error('getStudentsForParent stats error:', statsError.message);
  }

  return (profiles as Profile[]).map((p) => ({
    ...p,
    stats: (stats as MasteryStat[] || []).filter((s) => s.student_id === p.id),
  }));
}

export async function getAllStudentsForTeacher(): Promise<StudentWithStats[]> {
  if (isDemoSession()) {
    const studentProfile: Profile = {
      id: 'student-demo-id',
      email: 'student@demo.com',
      name: 'Demo Student',
      role: 'student',
      is_premium: true,
      current_activity: 'Feynman Photosynthesis 🌱',
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    const stats = getDemoMasteryStats();
    return [{
      ...studentProfile,
      stats: stats.filter(s => s.student_id === 'student-demo-id')
    }];
  }
  const supabase = getSupabase();
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student');

  if (profileError || !profiles) {
    console.error('getAllStudentsForTeacher error:', profileError?.message);
    return [];
  }

  const studentIds = profiles.map((p: Profile) => p.id);

  const { data: stats, error: statsError } = await supabase
    .from('mastery_stats')
    .select('*')
    .in('student_id', studentIds);

  if (statsError) {
    console.error('getAllStudentsForTeacher stats error:', statsError.message);
  }

  return (profiles as Profile[]).map((p) => ({
    ...p,
    stats: (stats as MasteryStat[] || []).filter((s) => s.student_id === p.id),
  }));
}

export async function getStudentStatsForStudent(studentId: string): Promise<MasteryStat[]> {
  if (isDemoSession()) {
    return getDemoMasteryStats().filter(s => s.student_id === studentId);
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mastery_stats')
    .select('*')
    .eq('student_id', studentId);
  
  if (error) {
    console.error('getStudentStatsForStudent error:', error.message);
    return [];
  }
  return data as MasteryStat[];
}

export async function updateProfilePremiumStatus(userId: string, isPremium: boolean): Promise<void> {
  if (isDemoSession()) {
    const demoUser = getDemoUser();
    if (demoUser && demoUser.id === userId) {
      demoUser.is_premium = isPremium;
      localStorage.setItem('study_buddy_demo_user', JSON.stringify(demoUser));
    }
    return;
  }
  const supabase = getSupabase();
  await supabase
    .from('profiles')
    .update({ is_premium: isPremium })
    .eq('id', userId);
}

export async function updateUserProfile(userId: string, name: string, updates?: any): Promise<void> {
  if (isDemoSession()) {
    const demoUser = getDemoUser();
    if (demoUser && demoUser.id === userId) {
      demoUser.name = name;
      if (updates) {
        Object.assign(demoUser, updates);
      }
      localStorage.setItem('study_buddy_demo_user', JSON.stringify(demoUser));
    }
    return;
  }
  const supabase = getSupabase();
  const { error } = await supabase
    .from('profiles')
    .update({ name, ...updates })
    .eq('id', userId);
  if (error) {
    throw new Error(error.message);
  }
}
