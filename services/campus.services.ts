import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  onSnapshot
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface CampusPost {
  id?: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: any;
}

export interface CampusStudent {
    id: string; // Using fixed ID for mock-to-real mapping
    name: string;
    faculty: string;
    bio: string;
    avatar: string;
    hearts: number;
    waves: number;
    isTrending?: boolean;
    rank?: number;
}

const POSTS_COLLECTION = "campus_posts";
const STUDENTS_COLLECTION = "campus_students";

export const campusService = {
  // Posts
  async createPost(post: Omit<CampusPost, "id" | "likes" | "comments" | "createdAt">) {
    return await addDoc(collection(db, POSTS_COLLECTION), {
      ...post,
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp()
    });
  },

  subscribeToPosts(callback: (posts: CampusPost[]) => void) {
    const q = query(collection(db, POSTS_COLLECTION), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as CampusPost));
      callback(posts);
    });
  },

  // Students
  async interactWithStudent(studentId: string, field: 'hearts' | 'waves') {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
    await updateDoc(studentRef, {
      [field]: increment(1)
    });
  },

  subscribeToStudents(callback: (students: CampusStudent[]) => void) {
    return onSnapshot(collection(db, STUDENTS_COLLECTION), (snapshot) => {
        const students = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as CampusStudent));
        callback(students);
    });
  }
};
