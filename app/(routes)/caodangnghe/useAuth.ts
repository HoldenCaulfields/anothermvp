import { useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "./useAuthStore";
import { syncUserProfile } from "./user.services";
import { toast } from "sonner";

let initialized = false;

export const useAuth = () => {
  const { user, profile, loading, authReady, setAuth, clearAuth, setLoading, setProfile } = useAuthStore();

  useEffect(() => {
    if (initialized) return;
    initialized = true;
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
    return () => {
      unsubscribe();
      initialized = false;
    };
  }, [setAuth, clearAuth, setLoading]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Đăng nhập thành công 🎉");
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Đăng nhập thất bại");
    }
  };

  const logout = async () => {
    await signOut(auth);
    clearAuth();
    toast.success("Đã đăng xuất");
  };

  return { user, profile, loading, authReady, login, logout, setProfile, isAuthenticated: !!user };
};
