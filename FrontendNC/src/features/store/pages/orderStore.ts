import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  colorName: string;
  colorHex: string;
  image: string;
}

export type OrderStatus = 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  readOrderIds: string[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  markOrderNotificationRead: (orderId: string) => void;
  markAllNotificationsRead: () => void;
}

const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2026-7892',
    customerName: 'Maria Paula Gómez',
    customerEmail: 'mariapaula@outlook.com',
    customerPhone: '+57 312 456 7890',
    customerAddress: 'Carrera 43A # 1-50, Poblado',
    customerCity: 'Medellín',
    items: [
      {
        productId: '1',
        productName: 'Bolso Canela',
        price: 380000,
        quantity: 1,
        colorName: 'Canela',
        colorHex: '#8B4513',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'
      },
      {
        productId: '2',
        productName: 'Mini Bogotá Rose',
        price: 220000,
        quantity: 1,
        colorName: 'Rose',
        colorHex: '#F4C2C2',
        image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800'
      }
    ],
    total: 600000,
    status: 'Procesando',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: 'ORD-2026-1049',
    customerName: 'Valentina Restrepo',
    customerEmail: 'vale.restrepo@gmail.com',
    customerPhone: '+57 300 765 4321',
    customerAddress: 'Calle 10B # 34-12, Laureles',
    customerCity: 'Medellín',
    items: [
      {
        productId: '3',
        productName: 'Clutch Medellín',
        price: 180000,
        quantity: 1,
        colorName: 'Dorado',
        colorHex: '#D4AF37',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800'
      }
    ],
    total: 180000,
    status: 'Entregado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  }
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: INITIAL_MOCK_ORDERS,
      readOrderIds: [],

      addOrder: (order: Order) => {
        set((state) => ({
          orders: [order, ...state.orders],
        }));
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
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
    }),
    {
      name: 'nc-orders-storage',
      partialize: (state) => ({
        orders: state.orders,
        readOrderIds: state.readOrderIds,
      }),
    }
  )
);
