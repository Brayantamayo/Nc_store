import type { PaginationMeta } from '../../../shared/types/pagination';

export interface VarianteApiItem {
  id: number;
  productoId: number;
  color: string;
  stock: number;
  activo: boolean;
  imagenes: string[];
  producto?: {
    id: number;
    nombre: string;
    slug: string;
  };
}

export interface VarianteDetailItem extends VarianteApiItem {
  producto?: VarianteApiItem['producto'] & {
    activo: boolean;
    categoria?: {
      id: number;
      nombre: string;
      slug: string;
    };
  };
}

export interface VarianteItemForm {
  color: string;
  stock: string;
  imagenes: string;
}

export interface VarianteForm {
  productoId: string;
  color: string;
  stock: string;
  imagenes: string;
  variantes?: VarianteItemForm[];
}

export interface VarianteResponse<T> {
  ok: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}
