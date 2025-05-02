import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useUserStore } from "../store/index";
import { client } from "../main";

const useAuthStore = create(
  // Persist is managing the local storage
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => {
        set({ token: null }),
          // Clear user data when logging out
          useUserStore.getState().clearUser();
        // Clear Apollo cache
        client.resetStore();
      },
    }),
    {
      name: "auth-storage", // Used as the key for local storage
    }
  )
);

export default useAuthStore;
