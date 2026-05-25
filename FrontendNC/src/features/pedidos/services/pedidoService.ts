import { ServiceResponse } from '../../../../shared/types/serviceResponse';
import { useOrderStore, Order, OrderStatus, OrderItem } from '../../store/pages/orderStore';
import { Product } from '../../../types';

export const pedidoService = {
  actualizarEstado: async (orderId: string, status: OrderStatus): Promise<ServiceResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      useOrderStore.getState().updateOrderStatus(orderId, status);
      return { success: true, message: 'Estado del pedido actualizado.' };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al actualizar el pedido.';
      return { success: false, message };
    }
  },

  eliminar: async (orderId: string): Promise<ServiceResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      useOrderStore.getState().deleteOrder(orderId);
      return { success: true, message: 'Pedido eliminado correctamente.' };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al eliminar el pedido.';
      return { success: false, message };
    }
  },

  simularCompra: (products: Product[]): Order | null => {
    if (products.length === 0) return null;

    const firstNames = ['Camila', 'Alejandra', 'Manuela', 'Isabella', 'Sofia', 'Juliana', 'Daniela'];
    const lastNames = ['Restrepo', 'Vásquez', 'Uribe', 'Gaviria', 'Montoya', 'Londoño', 'Cardona'];
    const cities = ['Medellín', 'Envigado', 'Sabaneta', 'Bello', 'Itagüí'];
    const streets = ['Calle 10', 'Carrera 43A', 'Avenida Las Vegas', 'Transversal Superior', 'Calle 50'];

    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomAddress = `${streets[Math.floor(Math.random() * streets.length)]} # ${Math.floor(10 + Math.random() * 80)}-${Math.floor(10 + Math.random() * 80)}`;
    const randomEmail = `${randomName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const randomPhone = `+57 3${Math.floor(10 + Math.random() * 90)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`;

    const itemsCount = Math.floor(Math.random() * 2) + 1;
    const orderItems: OrderItem[] = [];
    let computedTotal = 0;

    for (let i = 0; i < itemsCount; i++) {
      const prod = products[Math.floor(Math.random() * products.length)];
      const color = prod.colors[Math.floor(Math.random() * prod.colors.length)] || { name: 'Esmalte', hex: '#E5E4E2' };
      const qty = Math.floor(Math.random() * 2) + 1;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        price: prod.price,
        quantity: qty,
        colorName: color.name,
        colorHex: color.hex,
        image: prod.images[0],
      });

      computedTotal += prod.price * qty;
    }

    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      id: orderId,
      customerName: randomName,
      customerEmail: randomEmail,
      customerPhone: randomPhone,
      customerAddress: randomAddress,
      customerCity: randomCity,
      items: orderItems,
      total: computedTotal,
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
    };
  },
};
