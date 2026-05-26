import { create } from 'zustand';

interface CartFeedbackPayload {
  productName: string;
  quantity: number;
}

interface CartFeedbackState {
  successMessage: CartFeedbackPayload | null;
  showSuccess: (payload: CartFeedbackPayload) => void;
  hideSuccess: () => void;
}

export const useCartFeedbackStore = create<CartFeedbackState>((set) => ({
  successMessage: null,
  showSuccess: (payload) => set({ successMessage: payload }),
  hideSuccess: () => set({ successMessage: null }),
}));
