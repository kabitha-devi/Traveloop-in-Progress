import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: false,
  mobileSidebarOpen: false,
  toasts: [],
  modalContent: null,
  modalOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  addToast: (toast) => {
    const id = Date.now().toString();
    const newToast = { id, duration: 3000, ...toast };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, newToast.duration);
    return id;
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  openModal: (content) => set({ modalContent: content, modalOpen: true }),
  closeModal: () => set({ modalContent: null, modalOpen: false }),
}));

export default useUiStore;
