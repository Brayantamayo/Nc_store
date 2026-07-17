import api from '@/shared/api/api';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import type { PaginatedResponse } from '../../../../shared/types/pagination';
import type { ProductoApiItem, ProductoDetailItem, ProductoForm, ProductoResponse } from '../types';

const buildQuery = (page = 1, limit = 10) =>
  `?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`;

export const productoService = {
  listar: async (page = 1, limit = 10): Promise<PaginatedResponse<ProductoApiItem>> => {
    const { data } = await api.get<ProductoResponse<ProductoApiItem[]>>(`/productos${buildQuery(page, limit)}`);
    return { data: data.data, meta: data.meta! };
  },

  listarParaTienda: async (page = 1, limit = 10): Promise<PaginatedResponse<ProductoApiItem>> => {
    const { data } = await api.get<ProductoResponse<ProductoApiItem[]>>(`/productos/store/all${buildQuery(page, limit)}`);
    return { data: data.data, meta: data.meta! };
  },

  obtenerPorId: async (id: number): Promise<ProductoDetailItem> => {
    const { data } = await api.get<ProductoResponse<ProductoDetailItem>>(`/productos/${id}`);
    return data.data;
  },

  obtenerPorSlug: async (slug: string): Promise<ProductoDetailItem> => {
    const { data } = await api.get<ProductoResponse<ProductoDetailItem>>(`/productos/slug/${slug}`);
    return data.data;
  },

  obtenerPorSlugParaTienda: async (slug: string): Promise<ProductoDetailItem> => {
    const { data } = await api.get<ProductoResponse<ProductoDetailItem>>(`/productos/store/slug/${slug}`);
    return data.data;
  },

  crear: async (payload: {
    nombre: string;
    slug: string;
    descripcion?: string;
    precio: number;
    precioOriginal?: number | null;
    categoriaId: number;
    activo: boolean;
    esCombo?: boolean;
    opcionesCombo?: string[];
    imagenPrincipal?: string | null;
  }) => {
    const { data } = await api.post<ProductoResponse<ProductoDetailItem>>('/productos', payload);
    return data.data;
  },

  actualizar: async (
    id: number,
    payload: Partial<{
      nombre: string;
      slug: string;
      descripcion: string;
      precio: number;
      precioOriginal?: number | null;
      categoriaId: number;
      activo: boolean;
      esCombo: boolean;
      opcionesCombo: string[];
      imagenPrincipal: string | null;
    }>
  ) => {
    const { data } = await api.patch<ProductoResponse<ProductoDetailItem>>(`/productos/${id}`, payload);
    return data.data;
  },

  eliminar: async (id: number) => {
    const { data } = await api.delete<ProductoResponse<ProductoDetailItem>>(`/productos/${id}`);
    return data.data;
  },
};

export const productoErrorMessage = (error: unknown) => getErrorMessage(error, 'No pudimos cargar los productos.');
