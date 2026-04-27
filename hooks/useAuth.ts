import { useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/stores/useAuthStore";
import { syncUserProfile } from "@/services/user.services";

export const useAuth = () => {
  const { user, profile, loading, setAuth, clearAuth, setLoading, setProfile } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        try {
          const profileData = await syncUserProfile(firebaseUser);
          setAuth(firebaseUser, profileData);
        } catch (error) {
          console.error("Auth sync error:", error);
          setAuth(firebaseUser, null);
        }
      } else {
        clearAuth();
      }
    });

    return () => unsubscribe();
  }, [setAuth, clearAuth, setLoading]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    clearAuth();
  };

  return { user, profile, loading, login, logout, setProfile, isAuthenticated: !!user };
};