import { Variante } from '@prisma/client';
import { prisma } from '../../config/db';
import { buildPaginationMeta, PaginationParams } from '../../utils/paginar';
import {
  AjustarStockDto,
  CreateVarianteDto,
  UpdateVarianteDto,
} from './Validaciones/Variante.Schema';

type VarianteConProducto = VariantBase & {
  producto?: {
    id: number;
    nombre: string;
    slug: string;
  };
};

type VariantBase = Pick<Variante, 'id' | 'productoId' | 'color' | 'stock' | 'imagenes'>;

const varianteListSelect = {
  id: true,
  productoId: true,
  color: true,
  stock: true,
  imagenes: true,
  producto: {
    select: {
      id: true,
      nombre: true,
      slug: true,
    },
  },
} as const;

const varianteDetailSelect = {
  id: true,
  productoId: true,
  color: true,
  stock: true,
  imagenes: true,
  producto: {
    select: {
      id: true,
      nombre: true,
      slug: true,
      activo: true,
      categoria: {
        select: {
          id: true,
          nombre: true,
          slug: true,
        },
      },
    },
  },
} as const;

///---Asegurar que el producto existe y está activo---///
const ensureProductoExiste = async (productoId: number) => {
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    select: {
      id: true,
      nombre: true,
      activo: true,
    },
  });

  if (!producto) throw new Error(`Producto con id ${productoId} no encontrado`);
  if (!producto.activo) throw new Error(`El producto "${producto.nombre}" está inactivo`);

  return producto;
};

///---Obtener todas las variantes---///
export const getAllVariantes = async (
  pagination: PaginationParams,
): Promise<{
  data: VarianteConProducto[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> => {
  const [total, data] = await prisma.$transaction([
    prisma.variante.count(),
    prisma.variante.findMany({
      orderBy: { id: 'asc' },
      skip: pagination.skip,
      take: pagination.take,
      select: varianteListSelect,
    }),
  ]);

  return {
    data,
    meta: buildPaginationMeta(total, pagination.page, pagination.limit),
  };
};


///---Obtener variantes por producto---///
export const getAllVariantesByProducto = async (
  productoId: number,
  pagination: PaginationParams,
): Promise<{
  data: VarianteConProducto[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> => {
  await ensureProductoExiste(productoId);

  const [total, data] = await prisma.$transaction([
    prisma.variante.count({ where: { productoId } }),
    prisma.variante.findMany({
      where: { productoId },
      orderBy: { id: 'asc' },
      skip: pagination.skip,
      take: pagination.take,
      select: varianteListSelect,
    }),
  ]);

  return {
    data,
    meta: buildPaginationMeta(total, pagination.page, pagination.limit),
  };
};


///---Obtener variante por ID---///
export const getVarianteById = async (id: number) => {
  return prisma.variante.findUnique({
    where: { id },
    select: varianteDetailSelect,
  });
};


///---Crear variante---///
export const createVariante = async (data: CreateVarianteDto) => {
  await ensureProductoExiste(data.productoId);

  const duplicado = await prisma.variante.findFirst({
    where: {
      productoId: data.productoId,
      color: { equals: data.color, mode: 'insensitive' },
    },
    select: { id: true },
  });

  if (duplicado) {
    throw new Error(`Ya existe una variante de color "${data.color}" para este producto`);
  }

  return prisma.variante.create({
    data: {
      productoId: data.productoId,
      color: data.color,
      stock: data.stock ?? 0,
      imagenes: data.imagenes ?? [],
    },
    select: varianteDetailSelect,
  });
};


///---Actualizar variante---///
export const updateVariante = async (id: number, data: UpdateVarianteDto) => {
  const variante = await prisma.variante.findUnique({
    where: { id },
    select: {
      id: true,
      productoId: true,
    },
  });

  if (!variante) throw new Error(`Variante con id ${id} no encontrada`);

  if (data.color) {
    const duplicado = await prisma.variante.findFirst({
      where: {
        id: { not: id },
        productoId: variante.productoId,
        color: { equals: data.color, mode: 'insensitive' },
      },
      select: { id: true },
    });

    if (duplicado) {
      throw new Error(`Ya existe otra variante de color "${data.color}" para este producto`);
    }
  }

  if (data.stock !== undefined && data.stock < 0) {
    throw new Error('El stock no puede ser negativo');
  }

  return prisma.variante.update({
    where: { id },
    data: {
      color: data.color,
      stock: data.stock,
      imagenes: data.imagenes,
    },
    select: varianteDetailSelect,
  });
};


///---Ajustar stock de una variante---///
export const ajustarStock = async (id: number, data: AjustarStockDto) => {
  const variante = await prisma.variante.findUnique({
    where: { id },
    select: {
      id: true,
      stock: true,
    },
  });

  if (!variante) throw new Error(`Variante con id ${id} no encontrada`);

  const nuevoStock = variante.stock + data.cantidad;
  if (nuevoStock < 0) {
    throw new Error(
      `Stock insuficiente. Stock actual: ${variante.stock}, ajuste solicitado: ${data.cantidad}`,
    );
  }

  return prisma.variante.update({
    where: { id },
    data: { stock: nuevoStock },
    select: varianteDetailSelect,
  });
};


///---Eliminar variante---///
export const deleteVariante = async (id: number) => {
  const variante = await prisma.variante.findUnique({
    where: { id },
    select: {
      id: true,
      itemsPedido: {
        select: { id: true },
        take: 1,
      },
      itemsVenta: {
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!variante) throw new Error(`Variante con id ${id} no encontrada`);

  if (variante.itemsPedido.length > 0 || variante.itemsVenta.length > 0) {
    throw new Error('No se puede eliminar: la variante tiene pedidos o ventas asociadas');
  }

  return prisma.variante.delete({
    where: { id },
    select: varianteDetailSelect,
  });
};
