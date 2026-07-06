import { Pedido, Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { buildPaginationMeta, PaginationParams } from '../../utils/paginar';
import { CreatePedidoDto, UpdatePedidoDto } from './Validaciones/Pedido.schema';

type PedidoListado = Pick<
  Pedido,
  'id' | 'usuarioId' | 'clienteId' | 'estado' | 'total' | 'creadoEn'
> & {
  usuario: {
    id: number;
    email: string;
    nombre: string | null;
    apellido: string | null;
    nombreVisible: string | null;
  };
  cliente: {
    id: number;
    usuarioId: number;
    direccion: string | null;
    direccion2: string | null;
    region: string | null;
    ciudad: string | null;
    codigoPostal: string | null;
  };
  _count: {
    items: number;
  };
  pago: {
    id: number;
    metodo: string;
    estado: string;
    referencia: string | null;
    total: Prisma.Decimal;
    creadoEn: Date;
  } | null;
  venta: {
    id: number;
    total: Prisma.Decimal;
    creadoEn: Date;
  } | null;
  items: {
    id: number;
    cantidad: number;
    precio: Prisma.Decimal;
    variante: {
      color: string;
      imagenes: string[];
      producto: {
        id: number;
        nombre: string;
      };
    };
  }[];
};

const pedidoListSelect = {
  id: true,
  usuarioId: true,
  clienteId: true,
  estado: true,
  total: true,
  creadoEn: true,
  usuario: {
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      nombreVisible: true,
    },
  },
  cliente: {
    select: {
      id: true,
      usuarioId: true,
      direccion: true,
      direccion2: true,
      region: true,
      ciudad: true,
      codigoPostal: true,
    },
  },
  _count: {
    select: {
      items: true,
    },
  },
  pago: {
    select: {
      id: true,
      metodo: true,
      estado: true,
      referencia: true,
      total: true,
      creadoEn: true,
    },
  },
  venta: {
    select: {
      id: true,
      total: true,
      creadoEn: true,
    },
  },
  items: {
    select: {
      id: true,
      cantidad: true,
      precio: true,
      variante: {
        select: {
          color: true,
          imagenes: true,
          producto: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    },
  },
} as const;

const pedidoDetailSelect = {
  ...pedidoListSelect,
  items: {
    select: {
      id: true,
      pedidoId: true,
      varianteId: true,
      cantidad: true,
      precio: true,
      variante: {
        select: {
          id: true,
          color: true,
          stock: true,
          activo: true,
          imagenes: true,
          producto: {
            select: {
              id: true,
              nombre: true,
              slug: true,
              precio: true,
              activo: true,
            },
          },
        },
      },
    },
    orderBy: {
      id: 'asc' as const,
    },
  },
} as const;

const ensureClienteBelongsToUsuario = async (usuarioId: number, clienteId: number) => {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: {
      id: true,
      usuarioId: true,
    },
  });

  if (!cliente) {
    throw new Error(`Cliente con id ${clienteId} no encontrado`);
  }

  if (cliente.usuarioId !== usuarioId) {
    throw new Error('El cliente no pertenece al usuario indicado');
  }

  return cliente;
};

const ensureUniqueVariantIds = (items: CreatePedidoDto['items']) => {
  const variantIds = items.map((item) => item.varianteId);
  const uniqueIds = new Set(variantIds);

  if (uniqueIds.size !== variantIds.length) {
    throw new Error('No puedes repetir la misma variante en el pedido');
  }
};

export const getAllPedidos = async (
  pagination: PaginationParams,
): Promise<{
  data: PedidoListado[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> => {
  const [total, data] = await prisma.$transaction([
    prisma.pedido.count(),
    prisma.pedido.findMany({
      orderBy: { creadoEn: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      select: pedidoListSelect,
    }),
  ]);

  return {
    data,
    meta: buildPaginationMeta(total, pagination.page, pagination.limit),
  };
};

export const getPedidoById = async (id: number) => {
  return prisma.pedido.findUnique({
    where: { id },
    select: pedidoDetailSelect,
  });
};

export const createPedido = async (data: CreatePedidoDto) => {
  await ensureClienteBelongsToUsuario(data.usuarioId, data.clienteId);
  ensureUniqueVariantIds(data.items);

  const variantIds = data.items.map((item) => item.varianteId);
  const variantes = await prisma.variante.findMany({
    where: {
      id: { in: variantIds },
    },
    select: {
      id: true,
      stock: true,
      activo: true,
      color: true,
      producto: {
        select: {
          id: true,
          nombre: true,
          slug: true,
          precio: true,
          activo: true,
        },
      },
    },
  });

  if (variantes.length !== variantIds.length) {
    throw new Error('Una o más variantes no existen');
  }

  const varianteMap = new Map(variantes.map((variante) => [variante.id, variante]));
  const itemsConPrecio = data.items.map((item) => {
    const variante = varianteMap.get(item.varianteId);

    if (!variante) {
      throw new Error(`La variante con id ${item.varianteId} no existe`);
    }

    if (!variante.activo || !variante.producto.activo) {
      throw new Error(`La variante "${variante.color}" o su producto están inactivos`);
    }

    if (variante.stock < item.cantidad) {
      throw new Error(
        `Stock insuficiente para la variante "${variante.color}". Disponible: ${variante.stock}`,
      );
    }

    return {
      varianteId: item.varianteId,
      cantidad: item.cantidad,
      precio: Number(variante.producto.precio),
      stockRestante: variante.stock - item.cantidad,
    };
  });

  const total = itemsConPrecio.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );

  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.create({
      data: {
        usuarioId: data.usuarioId,
        clienteId: data.clienteId,
        estado: data.estado ?? 'PENDIENTE',
        total,
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      itemsConPrecio.map((item) =>
        tx.itemPedido.create({
          data: {
            pedidoId: pedido.id,
            varianteId: item.varianteId,
            cantidad: item.cantidad,
            precio: item.precio,
          },
        }),
      ),
    );

    await Promise.all(
      itemsConPrecio.map((item) =>
        tx.variante.update({
          where: { id: item.varianteId },
          data: {
            stock: item.stockRestante,
            activo: item.stockRestante <= 0 ? false : undefined,
          },
        }),
      ),
    );

    return tx.pedido.findUnique({
      where: { id: pedido.id },
      select: pedidoDetailSelect,
    });
  });
};

export const updatePedido = async (id: number, data: UpdatePedidoDto) => {
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
    },
  });

  if (!pedido) {
    throw new Error(`Pedido con id ${id} no encontrado`);
  }

  return prisma.pedido.update({
    where: { id },
    data: {
      estado: data.estado,
    },
    select: pedidoDetailSelect,
  });
};

export const deletePedido = async (id: number) => {
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    select: {
      id: true,
      pago: {
        select: {
          id: true,
        },
      },
      venta: {
        select: {
          id: true,
        },
      },
      items: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!pedido) {
    throw new Error(`Pedido con id ${id} no encontrado`);
  }

  if (pedido.pago || pedido.venta) {
    throw new Error('No se puede eliminar: el pedido tiene pago o venta asociada');
  }

  return prisma.$transaction(async (tx) => {
    await tx.itemPedido.deleteMany({
      where: { pedidoId: id },
    });

    return tx.pedido.delete({
      where: { id },
      select: pedidoDetailSelect,
    });
  });
};
