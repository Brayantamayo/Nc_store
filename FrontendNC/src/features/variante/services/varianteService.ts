import api from '@/shared/api/api';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import type { PaginatedResponse } from '../../../../shared/types/pagination';
import type { VarianteApiItem, VarianteDetailItem, VarianteForm, VarianteResponse } from '../types';

const buildQuery = (page = 1, limit = 10) =>
  `?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`;

export const varianteService = {
  listar: async (page = 1, limit = 10): Promise<PaginatedResponse<VarianteApiItem>> => {
    const { data } = await api.get<VarianteResponse<VarianteApiItem[]>>(`/variantes${buildQuery(page, limit)}`);
    return { data: data.data, meta: data.meta! };
  },

  listarPorProducto: async (productoId: number, page = 1, limit = 10): Promise<PaginatedResponse<VarianteApiItem>> => {
    const { data } = await api.get<VarianteResponse<VarianteApiItem[]>>(
      `/variantes/producto/${productoId}${buildQuery(page, limit)}`
    );
    return { data: data.data, meta: data.meta! };
  },

  obtenerPorId: async (id: number): Promise<VarianteDetailItem> => {
    const { data } = await api.get<VarianteResponse<VarianteDetailItem>>(`/variantes/${id}`);
    return data.data;
  },

  crear: async (payload: { productoId: number; color: string; stock: number; imagenes: string[]; activo?: boolean }) => {
    const { data } = await api.post<VarianteResponse<VarianteDetailItem>>('/variantes', payload);
    return data.data;
  },

  crearMasivo: async (payload: {
    productoId: number;
    variantes: { color: string; stock: number; imagenes: string[]; activo?: boolean }[];
  }) => {
    const { data } = await api.post<VarianteResponse<VarianteDetailItem[]>>('/variantes/bulk', payload);
    return data.data;
  },

  actualizar: async (id: number, payload: { color?: string; stock?: number; imagenes?: string[]; activo?: boolean }) => {
    const { data } = await api.patch<VarianteResponse<VarianteDetailItem>>(`/variantes/${id}`, payload);
    return data.data;
  },

  ajustarStock: async (id: number, cantidad: number) => {
    const { data } = await api.patch<VarianteResponse<VarianteDetailItem>>(`/variantes/${id}/stock`, { cantidad });
    return data.data;
  },

  eliminar: async (id: number) => {
    const { data } = await api.delete<VarianteResponse<VarianteDetailItem>>(`/variantes/${id}`);
    return data.data;
  },
};

export const varianteErrorMessage = (error: unknown) => getErrorMessage(error, 'No pudimos cargar las variantes.');
