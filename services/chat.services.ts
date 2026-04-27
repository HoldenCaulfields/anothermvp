import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  type: 'text' | 'youtube' | 'file';
  metadata?: any;
  createdAt: any;
}

export const chatService = {
  subscribeMessages(projectId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, "projects", projectId, "messages"),
      orderBy("createdAt", "asc")
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      callback(messages);
    });
  },

  async sendMessage(projectId: string, message: Omit<ChatMessage, "id" | "createdAt">) {
    await addDoc(collection(db, "projects", projectId, "messages"), {
      ...message,
      createdAt: serverTimestamp()
    });
  }
};
