import api from '@/shared/api/api';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import type { PaginatedResponse } from '../../../../shared/types/pagination';
import type { CategoriaApiItem, CategoriaDetailItem, CategoriaForm, CategoriaResponse, CategoriaTreeItem } from '../types';

const buildQuery = (page = 1, limit = 10) =>
  `?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`;

type CategoriaSubmitPayload = Omit<CategoriaForm, 'parentId'> & {
  parentId?: number;
};

export const categoriaService = {
  listar: async (page = 1, limit = 10): Promise<PaginatedResponse<CategoriaApiItem>> => {
    const { data } = await api.get<CategoriaResponse<CategoriaApiItem[]>>(`/categorias${buildQuery(page, limit)}`);
    return { data: data.data, meta: data.meta! };
  },

  arbol: async (): Promise<CategoriaTreeItem[]> => {
    const { data } = await api.get<CategoriaResponse<CategoriaTreeItem[]>>('/categorias/tree');
    return data.data;
  },

  obtenerPorId: async (id: number): Promise<CategoriaDetailItem> => {
    const { data } = await api.get<CategoriaResponse<CategoriaDetailItem>>(`/categorias/${id}`);
    return data.data;
  },

  crear: async (payload: CategoriaSubmitPayload) => {
    const { data } = await api.post<CategoriaResponse<CategoriaApiItem>>('/categorias', payload);
    return data.data;
  },

  actualizar: async (id: number, payload: CategoriaSubmitPayload) => {
    const { data } = await api.patch<CategoriaResponse<CategoriaApiItem>>(`/categorias/${id}`, payload);
    return data.data;
  },

  eliminar: async (id: number) => {
    const { data } = await api.delete<CategoriaResponse<CategoriaApiItem>>(`/categorias/${id}`);
    return data.data;
  },
};

export const categoriaErrorMessage = (error: unknown) => getErrorMessage(error, 'No pudimos cargar las categorías.');
