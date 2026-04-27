import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ChatMessage, ChatThread } from "./types";

export function threadIdFor(a: string, b: string) {
  return [a, b].sort().join("_");
}

export async function ensureThread(
  me: { uid: string; name: string; avatar: string },
  other: { uid: string; name: string; avatar: string }
) {
  const id = threadIdFor(me.uid, other.uid);
  await setDoc(
    doc(db, "threads", id),
    {
      participants: [me.uid, other.uid],
      participantNames: { [me.uid]: me.name, [other.uid]: other.name },
      participantAvatars: { [me.uid]: me.avatar, [other.uid]: other.avatar },
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
      unread: { [me.uid]: 0, [other.uid]: 0 },
    },
    { merge: true }
  );
  return id;
}

export function subscribeMyThreads(uid: string, cb: (ts: ChatThread[]) => void) {
  const q = query(collection(db, "threads"), where("participants", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    const ts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatThread, "id">) }));
    ts.sort((a, b) => {
      const ta = a.lastMessageAt?.toMillis?.() ?? 0;
      const tb = b.lastMessageAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    cb(ts);
  });
}

export function subscribeMessages(threadId: string, cb: (ms: ChatMessage[]) => void) {
  const q = query(collection(db, "threads", threadId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, "id">) })));
  });
}

export async function sendMessage(threadId: string, senderId: string, otherId: string, text: string) {
  await addDoc(collection(db, "threads", threadId, "messages"), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "threads", threadId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
}
