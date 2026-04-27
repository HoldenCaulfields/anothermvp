import { create } from "zustand";
import type { User } from "firebase/auth";
import type { UserProfile } from "./types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authReady: boolean;
  setAuth: (user: User | null, profile: UserProfile | null) => void;
  clearAuth: () => void;
  setLoading: (l: boolean) => void;
  setProfile: (p: UserProfile | null) => void;
  setAuthReady: (r: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  authReady: false,
  setAuth: (user, profile) => set({ user, profile, loading: false, authReady: true }),
  clearAuth: () => set({ user: null, profile: null, loading: false, authReady: true }),
  setLoading: (loading) => set({ loading }),
  setProfile: (profile) => set({ profile }),
  setAuthReady: (authReady) => set({ authReady }),
}));
