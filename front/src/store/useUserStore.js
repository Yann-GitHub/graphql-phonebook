import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  // TODO: Cache management !!
  persist(
    (set) => ({
      // Initial state
      user: null,

      setUser: (userData) => {
        // console.log("setting user data", userData);
        set({ user: userData });
      },
      clearUser: () => set({ user: null }),
      //   updateProfilePicture: (url) =>
      //     set((state) => ({
      //       user: state.user ? { ...state.user, profilePicture: url } : null,
      //     })),
    }),
    {
      name: "user-storage",
    }
  )
);

export default useUserStore;
