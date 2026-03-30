import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  success: (message, duration = 3000) => {
    return set((state) => {
      const id = Date.now();
      setTimeout(() => {
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
      return {
        toasts: [...state.toasts, { id, message, type: 'success' }],
      };
    });
  },
  
  error: (message, duration = 3000) => {
    return set((state) => {
      const id = Date.now();
      setTimeout(() => {
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
      return {
        toasts: [...state.toasts, { id, message, type: 'error' }],
      };
    });
  },
  
  info: (message, duration = 3000) => {
    return set((state) => {
      const id = Date.now();
      setTimeout(() => {
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
      return {
        toasts: [...state.toasts, { id, message, type: 'info' }],
      };
    });
  },
}));
