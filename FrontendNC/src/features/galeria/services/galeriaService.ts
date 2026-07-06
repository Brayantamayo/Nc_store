import api from '@/shared/api/api';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

export interface GaleriaImage {
  id: number;
  url: string;
  publicId: string;
  caption?: string | null;
  orden: number;
  creadoEn: string;
}

export const galeriaService = {
  listar: async (): Promise<GaleriaImage[]> => {
    const { data } = await api.get<{ ok: boolean; data: GaleriaImage[] }>('/galeria');
    return data.data;
  },

  subir: async (image: File, caption: string): Promise<GaleriaImage> => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    const { data } = await api.post<{ ok: boolean; data: GaleriaImage }>('/galeria/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.data;
  },

  eliminar: async (id: number): Promise<GaleriaImage> => {
    const { data } = await api.delete<{ ok: boolean; data: GaleriaImage }>(`/galeria/${id}`);
    return data.data;
  },
};

export const galeriaErrorMessage = (error: unknown) =>
  getErrorMessage(error, 'No pudimos cargar la galería.');
