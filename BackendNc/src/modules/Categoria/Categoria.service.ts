import { prisma } from '../../config/db';
import { buildPaginationMeta, PaginationParams } from '../../utils/paginar';
import {
  CreateCategoriaDto,
  UpdateCategoriaDto,
} from './Validaciones/Schema.categoria';

type CategoriaParent = {
  id: number;
  nombre: string;
  slug: string;
};

type CategoriaRecord = {
  id: number;
  nombre: string;
  slug: string;
  imagen: string | null;
  parentId: number | null;
  creadoEn: Date;
  parent: CategoriaParent | null;
  _count: {
    productos: number;
    children: number;
  };
};

type CategoriaDetalle = CategoriaRecord & {
  productos: Array<{
    id: number;
    nombre: string;
    slug: string;
    precio: unknown;
    activo: boolean;
    creadoEn: Date;
  }>;
  children: Array<{
    id: number;
    nombre: string;
    slug: string;
    imagen: string | null;
    parentId: number | null;
    creadoEn: Date;
    _count: {
      productos: number;
      children: number;
    };
  }>;
};

export type CategoriaTreeItem = CategoriaRecord & {
  children: CategoriaTreeItem[];
};

const categoriaListSelect = {
  id: true,
  nombre: true,
  slug: true,
  imagen: true,
  parentId: true,
  creadoEn: true,
  parent: {
    select: {
      id: true,
      nombre: true,
      slug: true,
    },
  },
  _count: {
    select: {
      productos: true,
      children: true,
    },
  },
} as const;

const categoriaDetailSelect = {
  ...categoriaListSelect,
  productos: {
    orderBy: { creadoEn: 'desc' as const },
    take: 10,
    select: {
      id: true,
      nombre: true,
      slug: true,
      precio: true,
      activo: true,
      creadoEn: true,
    },
  },
  children: {
    orderBy: { nombre: 'asc' as const },
    select: {
      id: true,
      nombre: true,
      slug: true,
      imagen: true,
      parentId: true,
      creadoEn: true,
      _count: {
        select: {
          productos: true,
          children: true,
        },
      },
    },
  },
} as const;

const buildCategoriaTree = (categorias: CategoriaRecord[]): CategoriaTreeItem[] => {
  const nodes = categorias.map((categoria) => ({
    ...categoria,
    children: [] as CategoriaTreeItem[],
  }));

  const byId = new Map<number, CategoriaTreeItem>();
  nodes.forEach((node) => {
    byId.set(node.id, node);
  });

  const roots: CategoriaTreeItem[] = [];

  nodes.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
      return;
    }

    roots.push(node);
  });

  const sortTree = (items: CategoriaTreeItem[]) => {
    items.sort((a, b) => a.nombre.localeCompare(b.nombre));
    items.forEach((item) => sortTree(item.children));
  };

  sortTree(roots);
  return roots;
};

const ensureRootParent = async (parentId: number, currentId?: number) => {
  if (currentId && parentId === currentId) {
    throw new Error('Una categoría no puede ser padre de sí misma');
  }

  const parent = await prisma.categoria.findUnique({
    where: { id: parentId },
    select: {
      id: true,
      parentId: true,
    } as any,
  }) as { id: number; parentId: number | null } | null;

  if (!parent) {
    throw new Error(`Categoría padre con id ${parentId} no encontrada`);
  }

  if (parent.parentId !== null) {
    throw new Error('Solo puedes usar categorías principales como padre');
  }
};

//---Obtener todas las categorías---///
export const getAllCategorias = async (
  pagination: PaginationParams,
): Promise<{
  data: CategoriaRecord[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> => {
  const total = await prisma.categoria.count();
  const data = (await prisma.categoria.findMany({
    orderBy: { creadoEn: 'desc' },
    skip: pagination.skip,
    take: pagination.take,
    select: categoriaListSelect as any,
  })) as unknown as CategoriaRecord[];

  return {
    data,
    meta: buildPaginationMeta(total, pagination.page, pagination.limit),
  };
};

export const getCategoriaTree = async (): Promise<CategoriaTreeItem[]> => {
  const categorias = (await prisma.categoria.findMany({
    orderBy: { creadoEn: 'desc' },
    select: categoriaListSelect as any,
  })) as unknown as CategoriaRecord[];

  return buildCategoriaTree(categorias);
};

//---Obtener categoría por ID---///
export const getCategoriaById = async (id: number) => {
  return (await prisma.categoria.findUnique({
    where: { id },
    select: categoriaDetailSelect as any,
  })) as unknown as CategoriaDetalle | null;
};

//---Obtener categoría por Slug---///
export const getCategoriaBySlug = async (slug: string) => {
  return (await prisma.categoria.findUnique({
    where: { slug },
    select: categoriaDetailSelect as any,
  })) as unknown as CategoriaDetalle | null;
};

//---Crear categoría---///
export const createCategoria = async (data: CreateCategoriaDto) => {
  const existe = await prisma.categoria.findFirst({
    where: {
      OR: [{ nombre: data.nombre }, { slug: data.slug }],
    },
  });

  if (existe) {
    throw new Error(
      existe.nombre === data.nombre
        ? `Ya existe una categoría con el nombre "${data.nombre}"`
        : `Ya existe una categoría con el slug "${data.slug}"`,
    );
  }

  if (data.parentId) {
    await ensureRootParent(data.parentId);
  }

  return (await prisma.categoria.create({
    data: {
      nombre: data.nombre,
      slug: data.slug,
      imagen: data.imagen,
      parentId: data.parentId ?? null,
    } as any,
    select: categoriaListSelect as any,
  })) as unknown as CategoriaRecord;
};

//---Actualizar categoría---//
export const updateCategoria = async (
  id: number,
  data: UpdateCategoriaDto,
) => {
  const categoria = await prisma.categoria.findUnique({ where: { id } });
  if (!categoria) throw new Error(`Categoría con id ${id} no encontrada`);

  if (data.nombre || data.slug) {
    const duplicado = await prisma.categoria.findFirst({
      where: {
        id: { not: id },
        OR: [
          ...(data.nombre ? [{ nombre: data.nombre }] : []),
          ...(data.slug ? [{ slug: data.slug }] : []),
        ],
      },
    });

    if (duplicado) {
      throw new Error(
        duplicado.nombre === data.nombre
          ? `Ya existe otra categoría con el nombre "${data.nombre}"`
          : `Ya existe otra categoría con el slug "${data.slug}"`,
      );
    }
  }

  if (data.parentId !== undefined && data.parentId !== null) {
    await ensureRootParent(data.parentId, id);
  }

  return (await prisma.categoria.update({
    where: { id },
    data: {
      nombre: data.nombre,
      slug: data.slug,
      imagen: data.imagen,
      parentId: data.parentId,
    } as any,
    select: categoriaListSelect as any,
  })) as unknown as CategoriaRecord;
};

//---Eliminar categoría---///
export const deleteCategoria = async (id: number) => {
  const categoria = await prisma.categoria.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      productos: {
        select: { id: true },
        take: 1,
      },
      children: {
        select: { id: true },
        take: 1,
      },
    } as any,
  }) as { id: number; nombre: string; productos: { id: number }[]; children: { id: number }[] } | null;

  if (!categoria) throw new Error(`Categoría con id ${id} no encontrada`);

  if (categoria.productos.length > 0) {
    throw new Error('No se puede eliminar: la categoría tiene productos asociados');
  }

  if (categoria.children.length > 0) {
    throw new Error('No se puede eliminar: la categoría tiene subcategorías asociadas');
  }

  return prisma.categoria.delete({ where: { id } });
};
