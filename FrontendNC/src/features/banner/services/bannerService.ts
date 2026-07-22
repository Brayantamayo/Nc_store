//esta es la llamda de la api 
import api from '@/shared/api/api';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

export interface BannerSlide {
  id: number;
  url: string;
  publicId: string;
  titulo: string;
  subtitulo: string;
  desc?: string | null;
  orden: number;
  activo: boolean;
  creadoEn: string;
}

export interface UpdateBannerPayload {
  titulo?: string;
  subtitulo?: string;
  desc?: string;
  activo?: boolean;
}

export const bannerService = {
  /** Para el HeroSection (público) */
  listarActivos: async (): Promise<BannerSlide[]> => {
    const { data } = await api.get<{ ok: boolean; data: BannerSlide[] }>('/banners/activos');
    return data.data;
  },

  /** Para el admin (requiere token) */
  listarTodos: async (): Promise<BannerSlide[]> => {
    const { data } = await api.get<{ ok: boolean; data: BannerSlide[] }>('/banners');
    return data.data;
  },

  subir: async (image: File, payload: { titulo: string; subtitulo: string; desc?: string }): Promise<BannerSlide> => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('titulo', payload.titulo);
    formData.append('subtitulo', payload.subtitulo);
    if (payload.desc) formData.append('desc', payload.desc);

    const { data } = await api.post<{ ok: boolean; data: BannerSlide }>('/banners/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  actualizar: async (id: number, payload: UpdateBannerPayload): Promise<BannerSlide> => {
    const { data } = await api.patch<{ ok: boolean; data: BannerSlide }>(`/banners/${id}`, payload);
    return data.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/banners/${id}`);
  },
};

export const bannerErrorMessage = (error: unknown) =>
  getErrorMessage(error, 'No pudimos cargar los banners.');
