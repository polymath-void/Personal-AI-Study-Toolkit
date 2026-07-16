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
