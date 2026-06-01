import { Categoria } from '@prisma/client';
import { prisma } from '../../config/db';
import { buildPaginationMeta, PaginationParams } from '../../utils/paginar';
import {
  CreateCategoriaDto,
  UpdateCategoriaDto,
} from './Validaciones/Schema.categoria';

type CategoriaConProductos = Categoria & { _count?: { productos: number } };
//---Obtener todas las categorías---///
export const getAllCategorias = async (
  pagination: PaginationParams,
): Promise<{
  data: CategoriaConProductos[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> => {
  const [total, data] = await prisma.$transaction([
    prisma.categoria.count(),
    prisma.categoria.findMany({
      orderBy: { creadoEn: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        nombre: true,
        slug: true,
        imagen: true,
        creadoEn: true,
        _count: {
          select: { productos: true },
        },
      },
    }),
  ]);

  return {
    data,
    meta: buildPaginationMeta(total, pagination.page, pagination.limit),
  };
};

//---Obtener categoría por ID---///
export const getCategoriaById = async (id: number) => {
  return prisma.categoria.findUnique({
    where: { id },
    include: {
      productos: {
        orderBy: { creadoEn: 'desc' },
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
    },
  });
};

//---Obtener categoría por Slug---///
export const getCategoriaBySlug = async (slug: string) => {
  return prisma.categoria.findUnique({
    where: { slug },
    include: {
      productos: {
        orderBy: { creadoEn: 'desc' },
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
    },
  });
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

  return prisma.categoria.create({
    data: {
      nombre: data.nombre,
      slug: data.slug,
      imagen: data.imagen,
    },
  });
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

  return prisma.categoria.update({
    where: { id },
    data: {
      nombre: data.nombre,
      slug: data.slug,
      imagen: data.imagen,
    },
  });
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
    },
  });

  if (!categoria) throw new Error(`Categoría con id ${id} no encontrada`);

  if (categoria.productos.length > 0) {
    throw new Error('No se puede eliminar: la categoría tiene productos asociados');
  }

  return prisma.categoria.delete({ where: { id } });
};
