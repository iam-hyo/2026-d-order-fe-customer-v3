import { create } from 'zustand';

type CartMergeToastState = {
  message: string | null;
  show: (message: string, durationMs?: number) => void;
  clear: () => void;
};

const DEFAULT_DURATION_MS = 2800;

let dismissTimerId: number | null = null;

function clearDismissTimer() {
  if (dismissTimerId == null) return;
  window.clearTimeout(dismissTimerId);
  dismissTimerId = null;
}

export const useCartMergeToastStore = create<CartMergeToastState>((set) => ({
  message: null,
  show: (message, durationMs = DEFAULT_DURATION_MS) => {
    clearDismissTimer();
    set({ message });
    dismissTimerId = window.setTimeout(() => {
      dismissTimerId = null;
      set({ message: null });
    }, durationMs);
  },
  clear: () => {
    clearDismissTimer();
    set({ message: null });
  },
}));
