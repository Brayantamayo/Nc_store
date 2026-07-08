import { Variante } from '@prisma/client';
import { prisma } from '../../config/db';
import { buildPaginationMeta, PaginationParams } from '../../utils/paginar';
import {
  AjustarStockDto,
  CreateVarianteDto,
  CreateManyVariantesDto,
  UpdateVarianteDto,
} from './Validaciones/Variante.Schema';

type VarianteConProducto = VariantBase & {
  producto?: {
    id: number;
    nombre: string;
    slug: string;
  };
};

type VariantBase = Pick<Variante, 'id' | 'productoId' | 'color' | 'stock' | 'activo' | 'imagenes'>;

const varianteListSelect = {
  id: true,
  productoId: true,
  color: true,
  stock: true,
  activo: true,
  imagenes: true,
  opcionComboNombre: true,
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
  activo: true,
  imagenes: true,
  opcionComboNombre: true,
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

  const stock = data.stock ?? 0;
  const activo = stock <= 0 ? false : (data.activo ?? true);

  return prisma.variante.create({
    data: {
      productoId: data.productoId,
      color: data.color,
      stock,
      activo,
      imagenes: data.imagenes ?? [],
      opcionComboNombre: data.opcionComboNombre,
    },
    select: varianteDetailSelect,
  });
};


///---Crear múltiples variantes---///
export const createManyVariantes = async (data: CreateManyVariantesDto) => {
  const { productoId, variantes } = data;
  await ensureProductoExiste(productoId);

  // 1. Validar duplicados dentro del mismo payload
  const colores = variantes.map(v => v.color.trim().toLowerCase());
  const uniqueColores = new Set(colores);
  if (uniqueColores.size !== colores.length) {
    throw new Error('No puedes enviar colores duplicados en el mismo formulario');
  }

  // 2. Validar duplicados contra la base de datos
  const duplicadosExistentes = await prisma.variante.findMany({
    where: {
      productoId,
      color: { in: variantes.map(v => v.color.trim()), mode: 'insensitive' },
    },
    select: { color: true },
  });

  if (duplicadosExistentes.length > 0) {
    const listColores = duplicadosExistentes.map(v => `"${v.color}"`).join(', ');
    throw new Error(`Ya existe una variante de color para este producto: ${listColores}`);
  }

  // 3. Crear todas las variantes en una transacción
  return prisma.$transaction(
    variantes.map(v => {
      const stock = v.stock ?? 0;
      const activo = stock <= 0 ? false : (v.activo ?? true);
      return prisma.variante.create({
        data: {
          productoId,
          color: v.color.trim(),
          stock,
          activo,
          imagenes: v.imagenes ?? [],
          opcionComboNombre: v.opcionComboNombre,
        },
        select: varianteDetailSelect,
      });
    })
  );
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

  let isActivo = data.activo;
  if (data.stock !== undefined && data.stock <= 0) {
    isActivo = false;
  }

  return prisma.variante.update({
    where: { id },
    data: {
      color: data.color,
      stock: data.stock,
      activo: isActivo,
      imagenes: data.imagenes,
      opcionComboNombre: data.opcionComboNombre,
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
    data: { 
      stock: nuevoStock,
      activo: nuevoStock <= 0 ? false : undefined,
    },
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
