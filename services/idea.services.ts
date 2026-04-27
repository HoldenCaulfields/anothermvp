import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp,
  getDoc,
  where,
  limit,
  onSnapshot
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Idea {
  id?: string;
  title: string;
  problem: string;
  solution: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  imageUrl: string;
  votes: string[]; // UIDs of users who voted
  commentCount: number;
  createdAt: any;
  updatedAt: any;
  demandPercentage?: number;
  location?: { 
    lat: number; 
    lng: number;
    address?: string;
  };
}

const IDEAS_COLLECTION = "ideas";

export const ideaService = {
  async createIdea(ideaData: Omit<Idea, "id" | "votes" | "commentCount" | "createdAt" | "updatedAt">) {
    const docRef = await addDoc(collection(db, IDEAS_COLLECTION), {
      ...ideaData,
      votes: [],
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      demandPercentage: Math.floor(Math.random() * 40) + 60 // Random for demo if not provided
    });
    return docRef.id;
  },

  async getAllIdeas() {
    const q = query(collection(db, IDEAS_COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Idea));
  },

  async getTopIdeas(limitCount: number = 100) {
    // In a real app, votes count would be a separate field for easier sorting
    const q = collection(db, IDEAS_COLLECTION);
    const snapshot = await getDocs(q);
    const ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Idea));
    return ideas.sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)).slice(0, limitCount);
  },

  async toggleVote(ideaId: string, userId: string) {
    const ideaRef = doc(db, IDEAS_COLLECTION, ideaId);
    const ideaSnap = await getDoc(ideaRef);
    if (!ideaSnap.exists()) return;

    const data = ideaSnap.data();
    const votes = data.votes || [];
    
    if (votes.includes(userId)) {
      await updateDoc(ideaRef, {
        votes: arrayRemove(userId)
      });
    } else {
      await updateDoc(ideaRef, {
        votes: arrayUnion(userId)
      });
    }
  },

  async addComment(ideaId: string, comment: any) {
    const commentRef = collection(db, IDEAS_COLLECTION, ideaId, "comments");
    await addDoc(commentRef, {
      ...comment,
      createdAt: serverTimestamp()
    });
    
    // Increment count
    const ideaRef = doc(db, IDEAS_COLLECTION, ideaId);
    const ideaSnap = await getDoc(ideaRef);
    if (ideaSnap.exists()) {
        await updateDoc(ideaRef, {
            commentCount: (ideaSnap.data().commentCount || 0) + 1
        });
    }
  },

  async subscribeComments(ideaId: string, callback: (comments: any[]) => void) {
    const q = query(collection(db, IDEAS_COLLECTION, ideaId, "comments"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(comments);
    });
  },

  async updateLocation(ideaId: string, location: { lat: number, lng: number, address?: string }) {
    const ideaRef = doc(db, IDEAS_COLLECTION, ideaId);
    await updateDoc(ideaRef, {
      location,
      updatedAt: serverTimestamp()
    });
  }
};
