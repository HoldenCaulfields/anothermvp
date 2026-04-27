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
import type { DatingProfile } from "./types";

export function subscribeDatingProfiles(cb: (ps: DatingProfile[]) => void) {
  const q = query(collection(db, "dating_profiles"), where("enabled", "==", true));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as DatingProfile));
  });
}

export async function upsertDatingProfile(p: Omit<DatingProfile, "createdAt">) {
  await setDoc(
    doc(db, "dating_profiles", p.uid),
    { ...p, createdAt: serverTimestamp() },
    { merge: true }
  );
}
