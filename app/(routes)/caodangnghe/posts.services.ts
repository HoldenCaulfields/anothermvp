import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Comment, Post } from "./types";

export function subscribePosts(cb: (posts: Post[]) => void, tag?: string) {
  const base = collection(db, "posts");
  const q = tag
    ? query(base, where("tag", "==", tag), orderBy("createdAt", "desc"), limit(50))
    : query(base, orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, "id">) })));
  });
}

export async function createPost(input: {
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  tag: string;
}) {
  await addDoc(collection(db, "posts"), {
    ...input,
    likes: 0,
    likedBy: [],
    commentsCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function toggleLike(postId: string, uid: string, liked: boolean) {
  await updateDoc(doc(db, "posts", postId), {
    likes: increment(liked ? -1 : 1),
    likedBy: liked ? arrayRemove(uid) : arrayUnion(uid),
  });
}

export async function deletePost(postId: string) {
  await deleteDoc(doc(db, "posts", postId));
}

export function subscribeComments(postId: string, cb: (cs: Comment[]) => void) {
  const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, postId, ...(d.data() as Omit<Comment, "id" | "postId">) })));
  });
}

export async function addComment(postId: string, input: {
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
}) {
  await addDoc(collection(db, "posts", postId, "comments"), {
    ...input,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "posts", postId), { commentsCount: increment(1) });
}
