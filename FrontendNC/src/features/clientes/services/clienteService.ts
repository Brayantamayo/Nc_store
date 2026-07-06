import api from '@/shared/api/api';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import type { ClienteDetalle, ClienteFormPayload, ClienteListado } from '../types';

type ClienteResponse<T> = {
  ok: boolean;
  data: T;
};

const buildQuery = (page = 1, limit = 100) =>
  `?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`;

export const clienteService = {
  listar: async (page = 1, limit = 100): Promise<ClienteListado[]> => {
    const { data } = await api.get<ClienteResponse<ClienteListado[]>>(`/clientes${buildQuery(page, limit)}`);
    return data.data;
  },

  obtenerPorId: async (id: number): Promise<ClienteDetalle> => {
    const { data } = await api.get<ClienteResponse<ClienteDetalle>>(`/clientes/${id}`);
    return data.data;
  },

  crear: async (payload: ClienteFormPayload): Promise<ClienteListado> => {
    const { data } = await api.post<ClienteResponse<ClienteListado>>('/clientes', payload);
    return data.data;
  },

  actualizar: async (id: number, payload: ClienteFormPayload): Promise<ClienteListado> => {
    const { data } = await api.patch<ClienteResponse<ClienteListado>>(`/clientes/${id}`, payload);
    return data.data;
  },
};

export const clienteErrorMessage = (error: unknown) =>
  getErrorMessage(error, 'No pudimos cargar los clientes.');
