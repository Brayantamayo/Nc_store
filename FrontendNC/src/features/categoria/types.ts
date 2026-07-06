import type { PaginationMeta } from '../../../shared/types/pagination';

export interface CategoriaApiItem {
  id: number;
  nombre: string;
  slug: string;
  imagen: string | null;
  parentId: number | null;
  parent: {
    id: number;
    nombre: string;
    slug: string;
  } | null;
  creadoEn: string;
  _count?: {
    productos: number;
    children: number;
  };
}

export interface CategoriaDetailItem extends CategoriaApiItem {
  children: CategoriaApiItem[];
  productos: Array<{
    id: number;
    nombre: string;
    slug: string;
    precio: string;
    activo: boolean;
    creadoEn: string;
  }>;
}

export interface CategoriaTreeItem extends CategoriaApiItem {
  children: CategoriaTreeItem[];
}

export interface CategoriaForm {
  nombre: string;
  slug: string;
  imagen: string;
  parentId: string;
}

export interface CategoriaResponse<T> {
  ok: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}
