import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import type { UserProfile } from "./types";

const DEPTS = ["CNTT", "QTKD", "Marketing", "Cơ khí", "Điện tử", "Báo chí"];
const COURSES = ["K22", "K23", "K24", "K25"];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "SV";
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function syncUserProfile(fbUser: User): Promise<UserProfile> {
  const ref = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const studentId = "SV" + Math.floor(1000 + Math.random() * 9000);
    const dept = DEPTS[Math.floor(Math.random() * DEPTS.length)];
    const course = COURSES[Math.floor(Math.random() * COURSES.length)];
    const profile: UserProfile = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || "Sinh viên",
      email: fbUser.email || "",
      photoURL: fbUser.photoURL || "",
      studentId,
      dept,
      course,
      bio: "",
      streakDays: 1,
      lastStreakDate: todayKey(),
      datingEnabled: false,
    };
    await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
    return profile;
  }

  const data = snap.data() as UserProfile;
  // Streak update
  const today = todayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (data.lastStreakDate !== today) {
    const newStreak = data.lastStreakDate === yesterday ? (data.streakDays || 0) + 1 : 1;
    await updateDoc(ref, { streakDays: newStreak, lastStreakDate: today });
    data.streakDays = newStreak;
    data.lastStreakDate = today;
  }
  return { ...data, uid: fbUser.uid };
}

export async function updateProfile(uid: string, patch: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), patch);
}

export function avatarFromName(name: string) {
  return initials(name);
}
