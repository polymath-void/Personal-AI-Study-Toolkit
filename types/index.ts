export type UserRole = 'student' | 'teacher' | 'parent';

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  created_at: string;
  current_activity?: string;
  last_active_at?: string;
  is_premium?: boolean;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'notification' | 'hint' | 'lesson';
  created_at: string;
  read: boolean;
}

export interface MasteryStat {
  id: string;
  student_id: string;
  subject: string;
  score: number;
  updated_at: string;
}

export interface ParentChildLink {
  parent_id: string;
  student_id: string;
}

export interface StudentWithStats extends Profile {
  stats: MasteryStat[];
}

export interface ChatRoom {
  id: string; // Maps to thread_id
  name?: string | null;
  is_group: boolean;
  created_at: string;
  created_by?: string;
  updated_at: string;
  // Computed client fields
  unread_count?: number;
  last_message?: string;
  last_message_at?: string;
  participants?: Profile[];
  // Thread model support
  thread_id?: string;
  parent_global_uid?: string;
  participant_one_uid?: string;
  participant_two_uid?: string;
  thread_type?: 'parent_teacher' | 'parent_kid' | 'teacher_kid';
}

export interface ChatParticipant {
  room_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at: string;
}

export interface ChatMessage {
  id: string; // Maps to message_id
  room_id: string; // Maps to thread_id
  sender_id: string; // Maps to sender_uid
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Client UI status for optimistic updates
  status?: 'sending' | 'sent' | 'failed';
  sender?: Profile;
  // Raw thread model fields
  message_id?: string;
  thread_id?: string;
  sender_uid?: string;
  parent_global_uid?: string;
}
