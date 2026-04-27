import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface MoodDoc {
  uid: string;
  emoji: string;
  label: string;
  date: string;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function setMyMood(uid: string, emoji: string, label: string) {
  const date = todayKey();
  await setDoc(doc(db, "moods", `${uid}_${date}`), {
    uid,
    emoji,
    label,
    date,
    createdAt: serverTimestamp(),
  });
}

export function subscribeTodayMoods(cb: (moods: MoodDoc[]) => void) {
  const q = query(collection(db, "moods"), where("date", "==", todayKey()));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as MoodDoc));
  });
}
