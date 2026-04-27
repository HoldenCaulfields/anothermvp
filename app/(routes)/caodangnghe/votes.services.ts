import {
  arrayUnion,
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { VoteCandidate } from "./types";

export function subscribeCandidates(
  category: "hoa_khoi" | "nam_sinh",
  cb: (cs: VoteCandidate[]) => void
) {
  const q = query(collection(db, "candidates"), where("category", "==", category));
  return onSnapshot(q, (snap) => {
    const list = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<VoteCandidate, "id">) }))
      .sort((a, b) => b.votes - a.votes);
    cb(list);
  });
}

export async function castVote(candidateId: string, uid: string) {
  await updateDoc(doc(db, "candidates", candidateId), {
    votes: increment(1),
    votedBy: arrayUnion(uid),
  });
}
