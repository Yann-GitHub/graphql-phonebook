import useAuthStore from "./useAuthStore";
// import useNotificationStore from "./useNotificationStore";
import useUserStore from "./useUserStore";

// Export all the stores for easier imports
export { useAuthStore, useUserStore };

// Export a single object containing all the stores
export const stores = {
  auth: useAuthStore,
  //   notification: useNotificationStore,
  user: useUserStore,
};
