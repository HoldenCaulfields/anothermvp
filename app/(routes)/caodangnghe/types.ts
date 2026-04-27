import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  studentId?: string; // MSSV
  dept?: string;
  course?: string; // K22 etc
  bio?: string;
  mood?: string;
  streakDays?: number;
  lastStreakDate?: string; // YYYY-MM-DD
  datingEnabled?: boolean;
  createdAt?: Timestamp;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  tag: string;
  likes: number;
  likedBy: string[];
  commentsCount: number;
  createdAt: Timestamp | null;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: Timestamp | null;
}

export interface EventDoc {
  id: string;
  title: string;
  date: string;
  dateTs: Timestamp;
  type: string;
  icon: string;
  going: number;
  goingUsers: string[];
  location?: string;
  description?: string;
}

export interface VoteCandidate {
  id: string;
  category: "hoa_khoi" | "nam_sinh";
  name: string;
  dept: string;
  avatar: string;
  votes: number;
  votedBy: string[];
}

export interface MoodEntry {
  uid: string;
  emoji: string;
  label: string;
  date: string; // YYYY-MM-DD
  createdAt: Timestamp;
}

export interface DatingProfile {
  uid: string;
  name: string;
  dept: string;
  avatar: string;
  photoURL?: string;
  mood: string;
  bio: string;
  enabled: boolean;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp | null;
}

export interface ChatThread {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  unread: Record<string, number>;
}
