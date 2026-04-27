import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  where,
  onSnapshot
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface AppNotification {
  id?: string;
  userId: string; // recipient
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'comment' | 'vote' | 'join_request' | 'milestone';
  content: string;
  link: string;
  read: boolean;
  createdAt: any;
}

const NOTIFICATIONS_COLLECTION = "notifications";

export const notificationService = {
  async notify(userId: string, data: Omit<AppNotification, "id" | "userId" | "read" | "createdAt">) {
    if (userId === data.senderId) return; // Don't notify self
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...data,
      userId,
      read: false,
      createdAt: serverTimestamp()
    });
  },

  subscribe(userId: string, callback: (notifications: AppNotification[]) => void) {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      callback(notes);
    });
  },

  async markAsRead(id: string) {
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, id), { read: true });
  }
};
