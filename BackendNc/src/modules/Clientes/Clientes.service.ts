import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { buildPaginationMeta, PaginationParams } from '../../utils/paginar';
import { CreateClienteDto, UpdateClienteDto } from './Validaciones/Cliente.schema';

type ClienteListado = {
  id: number;
  usuarioId: number;
  direccion: string | null;
  direccion2: string | null;
  region: string | null;
  ciudad: string | null;
  codigoPostal: string | null;
  activo: boolean;
  creadoEn: Date;
  usuario: {
    id: number;
    email: string;
    nombre: string | null;
    apellido: string | null;
    nombreVisible: string | null;
  };
  _count: {
    pedidos: number;
  };
};

type ClienteDetalle = ClienteListado & {
  pedidos: Array<{
    id: number;
    estado: string;
    total: Prisma.Decimal;
    creadoEn: Date;
    _count: {
      items: number;
    };
  }>;
};

const clienteListSelect = {
  id: true,
  usuarioId: true,
  direccion: true,
  direccion2: true,
  region: true,
  ciudad: true,
  codigoPostal: true,
  activo: true,
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
  _count: {
    select: {
      pedidos: true,
    },
  },
} as const;

const clienteDetailSelect = {
  ...clienteListSelect,
  pedidos: {
    orderBy: { creadoEn: 'desc' as const },
    take: 10,
    select: {
      id: true,
      estado: true,
      total: true,
      creadoEn: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
  },
} as const;

const getClienteRoleId = async () => {
  const rol = await prisma.role.findUnique({ where: { nombre: 'CLIENTE' } });
  if (!rol) {
    throw new Error('Rol CLIENTE no configurado en la base de datos');
  }

  return rol.id;
};

const buildNombreVisible = (dto: Pick<CreateClienteDto, 'firstName' | 'lastName' | 'displayName'>) =>
  dto.displayName.trim() || [dto.firstName, dto.lastName].filter(Boolean).join(' ').trim();

export const getAllClientes = async (
  pagination: PaginationParams,
  activo?: boolean,
): Promise<{
  data: Array<
    ClienteListado & {
      totalGastado: Prisma.Decimal;
      ultimoPedidoEn: Date | null;
    }
  >;
  meta: ReturnType<typeof buildPaginationMeta>;
}> => {
  const where = activo !== undefined ? { activo } : {};
  const total = await prisma.cliente.count({ where });
  const clientes = (await prisma.cliente.findMany({
    where,
    orderBy: { creadoEn: 'desc' },
    skip: pagination.skip,
    take: pagination.take,
    select: clienteListSelect as any,
  })) as unknown as ClienteListado[];

  const pedidosResumen = await prisma.pedido.groupBy({
    by: ['clienteId'],
    orderBy: { clienteId: 'asc' },
    _count: {
      _all: true,
    },
    _sum: {
      total: true,
    },
    _max: {
      creadoEn: true,
    },
  });

  const resumenMap = new Map(
    pedidosResumen.map((item) => [
      item.clienteId,
      {
        totalGastado: item._sum?.total ?? new Prisma.Decimal(0),
        ultimoPedidoEn: item._max?.creadoEn ?? null,
      },
    ]),
  );

  const data: Array<
    ClienteListado & {
      totalGastado: Prisma.Decimal;
      ultimoPedidoEn: Date | null;
    }
  > = clientes.map((cliente) => {
    const resumen = resumenMap.get(cliente.id);
    return {
      ...cliente,
      totalGastado: resumen?.totalGastado ?? new Prisma.Decimal(0),
      ultimoPedidoEn: resumen?.ultimoPedidoEn ?? null,
    };
  });

  return {
    data,
    meta: buildPaginationMeta(total, pagination.page, pagination.limit),
  };
};

export const getClienteById = async (id: number) => {
  return (await prisma.cliente.findUnique({
    where: { id },
    select: clienteDetailSelect as any,
  })) as ClienteDetalle | null;
};

export const createCliente = async (data: CreateClienteDto) => {
  const roleId = await getClienteRoleId();
  const email = data.email.toLowerCase();

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) {
    throw new Error('Ya existe un usuario con ese correo');
  }

  const hash = await bcrypt.hash(data.password, 12);
  const nombreVisible = buildNombreVisible(data);

  const cliente = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        email,
        password: hash,
        nombre: data.firstName,
        apellido: data.lastName || null,
        nombreVisible,
        roleId,
      },
    });

    return tx.cliente.create({
      data: {
        usuarioId: usuario.id,
        direccion: data.addressLine1 || null,
        direccion2: data.addressLine2 || null,
        region: data.region || null,
        ciudad: data.city || null,
        codigoPostal: data.postalCode || null,
      },
      select: clienteListSelect as any,
    });
  });

  return cliente as unknown as ClienteListado;
};

export const updateCliente = async (id: number, data: UpdateClienteDto) => {
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { usuario: true },
  });

  if (!cliente) {
    throw new Error(`Cliente con id ${id} no encontrado`);
  }

  if (data.email && data.email !== cliente.usuario.email) {
    const existeEmail = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (existeEmail && existeEmail.id !== cliente.usuarioId) {
      throw new Error('Ya existe otro usuario con ese correo');
    }
  }

  const nombre = data.firstName ?? cliente.usuario.nombre ?? '';
  const apellido = data.lastName !== undefined ? data.lastName : (cliente.usuario.apellido ?? null);
  const nombreBase = [nombre, apellido].filter(Boolean).join(' ').trim();
  const nombreVisible = data.displayName || nombreBase || cliente.usuario.nombreVisible || nombre;

  const usuarioUpdateData: Prisma.UsuarioUpdateInput = {
    email: data.email,
    nombre: data.firstName,
    apellido: data.lastName,
    nombreVisible,
  };

  if (data.password) {
    usuarioUpdateData.password = await bcrypt.hash(data.password, 12);
  }

  const [usuarioActualizado, clienteActualizado] = await prisma.$transaction([
    prisma.usuario.update({
      where: { id: cliente.usuarioId },
      data: usuarioUpdateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        nombreVisible: true,
      },
    }),
    prisma.cliente.update({
      where: { id },
      data: {
        direccion: data.addressLine1,
        direccion2: data.addressLine2,
        region: data.region,
        ciudad: data.city,
        codigoPostal: data.postalCode,
      },
      select: clienteListSelect as any,
    }),
  ]);

  return {
    ...clienteActualizado,
    usuario: usuarioActualizado,
  } as unknown as ClienteListado;
};

export const toggleClienteActivo = async (id: number) => {
  const cliente = await prisma.cliente.findUnique({ where: { id } });

  if (!cliente) {
    throw new Error(`Cliente con id ${id} no encontrado`);
  }

  return prisma.cliente.update({
    where: { id },
    data: { activo: !cliente.activo },
    select: clienteListSelect as any,
  }) as unknown as Promise<ClienteListado>;
};
