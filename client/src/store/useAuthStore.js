import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,

  checkAuth: async () => {
    // show loader
    set({ isCheckingAuth: true });

    try {
      const res = await fetch("http://localhost:5000/api/auth/check", {
        credentials: 'include',
      });

      if (res.ok) {
        // only parse JSON on 200
        const data = await res.json();
        console.log("Authenticated user:", data);
        set({ authUser: data });
      } else {
        console.warn("Auth check failed with status:", res.status);
        // clear any stale user
        set({ authUser: null });
      }
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      // hide loader
      set({ isCheckingAuth: false });
    }
  }
}));
