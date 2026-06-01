import { Producto } from '@prisma/client';
import { prisma } from '../../config/db';
import { buildPaginationMeta, PaginationParams } from '../../utils/paginar';
import { CreateProductoDto, UpdateProductoDto } from './Validaciones/Schema.producto';

type ProductoListItem = Pick<
  Producto,
  'id' | 'nombre' | 'slug' | 'descripcion' | 'precio' | 'categoriaId' | 'activo' | 'creadoEn'
> & {
  categoria: {
    id: number;
    nombre: string;
    slug: string;
  };
  _count: {
    variantes: number;
  };
};

const productListSelect = {
  id: true,
  nombre: true,
  slug: true,
  descripcion: true,
  precio: true,
  categoriaId: true,
  activo: true,
  creadoEn: true,
  categoria: {
    select: {
      id: true,
      nombre: true,
      slug: true,
    },
  },
  _count: {
    select: {
      variantes: true,
    },
  },
} as const;

const productDetailSelect = {
  ...productListSelect,
  variantes: {
    select: {
      id: true,
      color: true,
      stock: true,
      imagenes: true,
    },
    take: 10,
    orderBy: {
      id: 'asc' as const,
    },
  },
} as const;

//---Asegurar que la categoría existe---///
const ensureCategoriaExists = async (categoriaId: number) => {
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaId },
    select: {
      id: true,
      nombre: true,
    },
  });

  if (!categoria) {
    throw new Error(`Categoría con id ${categoriaId} no encontrada`);
  }

  return categoria;
};

//---Obtener todos los productos---///
export const getAllProductos = async (
  pagination: PaginationParams,
): Promise<{
  data: ProductoListItem[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> => {
  const [total, data] = await prisma.$transaction([
    prisma.producto.count(),
    prisma.producto.findMany({
      orderBy: { creadoEn: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      select: productListSelect,
    }),
  ]);

  return {
    data,
    meta: buildPaginationMeta(total, pagination.page, pagination.limit),
  };
};

//---Obtener producto por ID---///
export const getProductoById = async (id: number) => {
  return prisma.producto.findUnique({
    where: { id },
    select: productDetailSelect,
  });
};

//---Obtener producto por Slug---///
export const getProductoBySlug = async (slug: string) => {
  return prisma.producto.findUnique({
    where: { slug },
    select: productDetailSelect,
  });
};

///---Crear producto---///
export const createProducto = async (data: CreateProductoDto) => {
  await ensureCategoriaExists(data.categoriaId);

  const existente = await prisma.producto.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (existente) {
    throw new Error(`Ya existe un producto con el slug "${data.slug}"`);
  }

  return prisma.producto.create({
    data: {
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion,
      precio: data.precio,
      categoriaId: data.categoriaId,
      activo: data.activo ?? true,
    },
    select: productDetailSelect,
  });
};

///---Actualizar producto---///
export const updateProducto = async (id: number, data: UpdateProductoDto) => {
  const producto = await prisma.producto.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      categoriaId: true,
    },
  });

  if (!producto) throw new Error(`Producto con id ${id} no encontrado`);

  if (data.categoriaId !== undefined) {
    await ensureCategoriaExists(data.categoriaId);
  }

  if (data.slug && data.slug !== producto.slug) {
    const duplicado = await prisma.producto.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });

    if (duplicado) {
      throw new Error(`Ya existe otro producto con el slug "${data.slug}"`);
    }
  }

  return prisma.producto.update({
    where: { id },
    data: {
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion,
      precio: data.precio,
      categoriaId: data.categoriaId,
      activo: data.activo,
    },
    select: productDetailSelect,
  });
};

///---Eliminar producto---///
export const deleteProducto = async (id: number) => {
  const producto = await prisma.producto.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      variantes: {
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!producto) throw new Error(`Producto con id ${id} no encontrado`);

  if (producto.variantes.length > 0) {
    throw new Error('No se puede eliminar: el producto tiene variantes asociadas');
  }

  return prisma.producto.delete({
    where: { id },
    select: productDetailSelect,
  });
};
