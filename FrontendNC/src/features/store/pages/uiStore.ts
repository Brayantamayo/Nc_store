//uiStore.ts: Controla cosas visuales, como "si el menú está abierto o cerrado".
import { create } from 'zustand';
import { UIState } from '../../../types';

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
}));
