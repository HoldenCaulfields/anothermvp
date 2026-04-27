import {
  doc, collection, 
  setDoc, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot,
  deleteDoc, where, getDocs,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "./uploadToCloudinary";

// 1. Chỉnh sửa hàm Toggle Vote
export async function toggleVote(userId: string, candidateId: string, contestId: string) {
  // Tạo ID duy nhất để tránh việc 1 người vote nhiều lần cho 1 người trong cùng 1 cuộc thi
  const voteId = `${userId}_${contestId}_${candidateId}`;
  const voteRef = doc(db, "votes", voteId);
  const candidateRef = doc(db, "candidates", candidateId);

  const snap = await getDoc(voteRef);

  if (snap.exists()) {
    await deleteDoc(voteRef);
    await updateDoc(candidateRef, { votesCount: increment(-1) });
    return false;
  } else {
    await setDoc(voteRef, {
      userId,
      candidateId,
      contestId, // Thêm contestId vào đây
      createdAt: serverTimestamp(),
    });
    await updateDoc(candidateRef, { votesCount: increment(1) });
    return true;
  }
}

// 2. Chỉnh sửa hàm Tạo Candidate
export async function createCandidate(data: {
  name: string;
  sbd: string;
  dept: string;
  file: File;
  contestId: string;
}) {
  try {
    // Tải ảnh lên Cloudinary để lấy link URL (String)
    const imgUrl = await uploadToCloudinary(data.file);
    if (!imgUrl) throw new Error("Upload ảnh thất bại");

    // Tách 'file' ra khỏi data để không gửi nó vào Firestore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { file, ...restData } = data;

    const docRef = await addDoc(collection(db, "candidates"), {
      ...restData,        // Chỉ bao gồm name, sbd, dept, contestId
      img: imgUrl,        // Lưu đường dẫn ảnh thay vì file nhị phân
      votesCount: 0,
      createdAt: serverTimestamp(),
    });

    return docRef;
  } catch (error) {
    console.error("Error logic createCandidate:", error);
    throw error;
  }
}

// 3. Realtime Top 10 THEO CUỘC THI
export function subscribeTop10(contestId: string, callback: (data: any[]) => void) {
  const q = query(
    collection(db, "candidates"),
    where("contestId", "==", contestId), // Lọc theo cuộc thi
    orderBy("votesCount", "desc"),
    limit(10)
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

// 4. Lấy danh sách đã vote của User THEO CUỘC THI
export function subscribeUserVotes(
  userId: string,
  contestId: string, // Thêm contestId
  callback: (ids: string[]) => void
) {
  const q = query(
    collection(db, "votes"),
    where("userId", "==", userId),
    where("contestId", "==", contestId) // Chỉ lấy lượt vote trong cuộc thi này
  );

  return onSnapshot(q, (snap) => {
    const ids = snap.docs.map((doc) => doc.data().candidateId);
    callback(ids);
  });
}