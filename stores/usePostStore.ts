import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, updateDoc, increment, deleteDoc, getDoc, setDoc } from 'firebase/firestore';

export type Category = 'all' | 'jobs' | 'travel' | 'market' | 'contest';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: Category;
  content: string;
  title: string;
  time: string;
  likes: number;
  comments: number;
  price?: string;
  salary?: string;
  tags?: string[];
  location?: string; //new
  image?: string;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: Timestamp;
}

interface PostState {
  posts: Post[];
  selectedCategory: Category;
  loading: boolean;
  setCategory: (category: Category) => void;
  fetchPosts: (userId?: string) => any;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  addComment: (postId: string, userId: string, userName: string, userAvatar: string, content: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  selectedCategory: 'all',
  posts: [],
  loading: true,
  setCategory: (category) => set({ selectedCategory: category }),
  fetchPosts: () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().createdAt?.toDate().toLocaleString('vi-VN') || 'Đang đăng...',
      })) as Post[];
      set({ posts, loading: false });
    });
    return unsubscribe;
  },
  toggleLike: async (postId: string, userId: string) => {
    const likeRef = doc(db, 'posts', postId, 'likes', userId);
    const postRef = doc(db, 'posts', postId);
    
    const likeDoc = await getDoc(likeRef);
    const isLiked = likeDoc.exists();

    if (isLiked) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likes: increment(-1) });
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(postRef, { likes: increment(1) });
    }
  },
  addComment: async (postId: string, userId: string, userName: string, userAvatar: string, content: string) => {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const postRef = doc(db, 'posts', postId);

    await addDoc(commentsRef, {
      authorId: userId,
      authorName: userName,
      authorAvatar: userAvatar,
      content,
      createdAt: serverTimestamp(),
    });

    await updateDoc(postRef, { comments: increment(1) });
  },
}));
