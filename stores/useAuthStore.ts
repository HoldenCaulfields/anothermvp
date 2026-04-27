import { create } from "zustand";
import { User } from "firebase/auth";
import { UserProfile } from "@/services/user.services";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setAuth: (user: User | null, profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  setProfile: (profile: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true, // Khởi đầu là true để chờ Firebase check session
  setAuth: (user, profile) => set({ user, profile, loading: false }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ user: null, profile: null, loading: false }),
  setProfile: (profile) => set({ profile }),
}));