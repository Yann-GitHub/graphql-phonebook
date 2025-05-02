import { create } from "zustand";
import { toast } from "react-toastify";

// Wrapper autour de react-toastify pour conserver votre API existante
const useNotificationStore = create(() => ({
  // Pas besoin de stocker les notifications dans le state
  // car react-toastify gère cela en interne

  addNotification: (notification) => {
    const { type, message, duration = 5000 } = notification;

    const toastOptions = {
      autoClose: duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "info":
        toast.info(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  },

  // Cette fonction peut être conservée pour compatibilité
  // mais elle n'est plus nécessaire d'être appelée manuellement
  removeNotification: (id) => {
    toast.dismiss(id);
  },
}));

export default useNotificationStore;
