import api from '@/shared/api/api';
import { ServiceResponse } from '../../../../shared/types/serviceResponse';
import { Order, OrderStatus } from '../../store/pages/orderStore';

export const pedidoService = {
  listar: async (): Promise<{ data: Order[] }> => {
    try {
      const { data } = await api.get('/pedidos?limit=100');
      const mapped: Order[] = data.data.map((p: any) => ({
        id: String(p.id),
        customerName: p.cliente?.nombre || p.usuario?.nombre || 'Desconocido',
        customerEmail: p.usuario?.email || '',
        customerPhone: '',
        customerAddress: p.cliente?.direccion || '',
        customerCity: p.cliente?.ciudad || '',
        items: p.items ? p.items.map((i: any) => ({
          productId: String(i.variante?.producto?.id),
          productName: i.variante?.producto?.nombre || 'Producto',
          price: Number(i.precio),
          quantity: i.cantidad,
          colorName: i.variante?.color || '',
          colorHex: '#000',
          image: i.variante?.imagenes?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
        })) : [],
        total: Number(p.total),
        status: p.estado,
        createdAt: String(p.creadoEn),
      }));
      return { data: mapped };
    } catch (e: unknown) {
      console.error('Error fetching orders:', e);
      return { data: [] };
    }
  },

  actualizarEstado: async (orderId: string, status: OrderStatus): Promise<ServiceResponse> => {
    try {
      await api.patch(`/pedidos/${orderId}`, { estado: status });
      return { success: true, message: 'Estado del pedido actualizado.' };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al actualizar el pedido.';
      return { success: false, message };
    }
  },

  eliminar: async (orderId: string): Promise<ServiceResponse> => {
    try {
      await api.delete(`/pedidos/${orderId}`);
      return { success: true, message: 'Pedido eliminado correctamente.' };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al eliminar el pedido.';
      return { success: false, message };
    }
  },
};
