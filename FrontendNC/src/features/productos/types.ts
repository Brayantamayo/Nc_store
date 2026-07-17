import type { PaginationMeta } from '../../../shared/types/pagination';

export interface ProductoApiItem {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  precio: string;
  precioOriginal?: string | null;
  esCombo?: boolean;
  opcionesCombo?: string[] | null;
  categoriaId: number;
  activo: boolean;
  creadoEn: string;
  imagenPrincipal?: string | null;
  categoria: {
    id: number;
    nombre: string;
    slug: string;
  };
  _count: {
    variantes: number;
  };
  variantes?: Array<{
    id?: number;
    color?: string;
    stock?: number;
    activo?: boolean;
    imagenes: string[];
  }>;
}

export interface ProductoDetailItem extends ProductoApiItem {
  imagenPrincipal?: string | null;
  variantes: Array<{
    id: number;
    color: string;
    stock: number;
    imagenes: string[];
  }>;
}

export interface ProductoForm {
  nombre: string;
  slug: string;
  descripcion: string;
  precio: string;
  precioOriginal: string;
  esCombo: boolean;
  opcionesCombo: string[];
  categoriaId: string;
  activo: boolean;
  imagenPrincipal: string;
}

export interface ProductoResponse<T> {
  ok: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}
