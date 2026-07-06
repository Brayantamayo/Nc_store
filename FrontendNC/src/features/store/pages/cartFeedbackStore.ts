import { create } from 'zustand';
import { toast } from 'sonner';
import { useCartStore } from './cartStore';

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
  showSuccess: ({ productName, quantity }) => {
    const openCart = () => useCartStore.getState().toggleCart(true);

    toast.success('Agregado al carrito', {
      description: quantity > 1 ? `${productName} x${quantity}` : productName,
      action: {
        label: 'Ver carrito',
        onClick: openCart,
      },
    });

    set({ successMessage: null });
  },
  hideSuccess: () => set({ successMessage: null }),
}));
