import { User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  bio?: string;
  skills?: string[];
  availability?: string;
  rating?: number;
  portfolio?: { title: string; link: string }[];
  socialLinks?: {
    github?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  createdAt: any;
  updatedAt: any;
}

export const syncUserProfile = async (user: User): Promise<UserProfile | null> => {
  return userService.syncUserProfile(user);
};

export const userService = {
    async syncUserProfile(user: User): Promise<UserProfile | null> {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: "Young Explorer",
                bio: "Đam mê sáng tạo và ham học hỏi. Sẵn sàng kết nối để cùng phát triển.",
                skills: ["Sáng tạo", "Làm việc nhóm"],
                availability: "Sẵn sàng",
                rating: 5.0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            return newProfile;
        }

        return userDoc.data() as UserProfile;
    },

    async getAllUsers(): Promise<UserProfile[]> {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as UserProfile);
    },

    async getUserProfile(uid: string): Promise<UserProfile | null> {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        return userDoc.exists() ? userDoc.data() as UserProfile : null;
    },

    async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
        const userDocRef = doc(db, "users", uid);
        await setDoc(userDocRef, {
            ...updates,
            updatedAt: serverTimestamp()
        }, { merge: true });
    }
};
