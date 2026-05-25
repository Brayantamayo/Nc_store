import { create } from 'zustand';

export interface FlyToCartPayload {
  imageUrl: string;
  startX: number;
  startY: number;
  startSize: number;
}

interface FlyToCartState {
  current: FlyToCartPayload | null;
  cartPulse: boolean;
  triggerFly: (imageUrl: string, sourceElement: HTMLElement) => void;
  completeFly: () => void;
}

export const useFlyToCartStore = create<FlyToCartState>((set) => ({
  current: null,
  cartPulse: false,

  triggerFly: (imageUrl, sourceElement) => {
    const rect = sourceElement.getBoundingClientRect();
    const size = Math.min(120, Math.max(56, Math.min(rect.width, rect.height)));

    set({
      current: {
        imageUrl,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        startSize: size,
      },
    });
  },

  completeFly: () => {
    set({ current: null, cartPulse: true });
    window.setTimeout(() => set({ cartPulse: false }), 700);
  },
}));
