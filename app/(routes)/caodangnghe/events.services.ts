import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EventDoc } from "./types";

export function subscribeEvents(cb: (events: EventDoc[]) => void) {
  const q = query(collection(db, "events"), orderBy("dateTs", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventDoc, "id">) })));
  });
}

export async function toggleRsvp(eventId: string, uid: string, going: boolean) {
  await updateDoc(doc(db, "events", eventId), {
    going: increment(going ? -1 : 1),
    goingUsers: going ? arrayRemove(uid) : arrayUnion(uid),
  });
}
