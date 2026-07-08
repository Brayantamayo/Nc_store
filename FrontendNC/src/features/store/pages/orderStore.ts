import { create } from 'zustand';
import { pedidoService } from '../../pedidos/services/pedidoService';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  colorName: string;
  colorHex: string;
  image: string;
  detallesCombo?: Record<string, string>;
}

export type OrderStatus = 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface Order {
  id: string;
  customerName: string;
  customerLastName?: string;
  customerEmail: string;
  customerPhone: string;
  customerIdType?: string;
  customerIdNumber?: string;
  customerCountry?: string;
  customerAddress: string;
  customerAddress2?: string;
  customerCity: string;
  customerDepartment?: string;
  customerPostalCode?: string;
  orderNotes?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  readOrderIds: string[];
  isLoading: boolean;
  hasLoaded: boolean;
  loadOrders: () => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  markOrderNotificationRead: (orderId: string) => void;
  markAllNotificationsRead: () => void;
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  readOrderIds: [],
  isLoading: false,
  hasLoaded: false,

  loadOrders: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const response = await pedidoService.listar();
      set({ orders: response.data, hasLoaded: true });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  addOrder: (order: Order) => {
    set((state) => ({
      orders: [order, ...state.orders],
    }));
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
  },

  deleteOrder: (orderId: string) => {
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
      readOrderIds: state.readOrderIds.filter((id) => id !== orderId),
    }));
  },

  markOrderNotificationRead: (orderId: string) => {
    const { readOrderIds } = get();
    if (readOrderIds.includes(orderId)) return;
    set({ readOrderIds: [...readOrderIds, orderId] });
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      readOrderIds: state.orders.map((o) => o.id),
    }));
  },
}));
