import { PrismaClient, Variante } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateVarianteDto {
productoId: number;
color: string;
stock?: number;
imagenes?: string[];
}

export interface UpdateVarianteDto {
color?: string;
stock?: number;
imagenes?: string[];
}

export interface AjustarStockDto {
  cantidad: number; // positivo = sumar, negativo = restar
}

// ─── READ ────────────────────────────────────────────

export const getAllVariantesByProducto = async (productoId: number): Promise<Variante[]> => {
const producto = await prisma.producto.findUnique({ where: { id: productoId } });
if (!producto) throw new Error(`Producto con id ${productoId} no encontrado`);

return prisma.variante.findMany({
    where: { productoId },
    orderBy: { id: "asc" },
});
};

export const getVarianteById = async (id: number): Promise<Variante | null> => {
return prisma.variante.findUnique({
    where: { id },
    include: { producto: true },
});
};

// ─── CREATE ──────────────────────────────────────────

export const createVariante = async (data: CreateVarianteDto): Promise<Variante> => {
const producto = await prisma.producto.findUnique({ where: { id: data.productoId } });
if (!producto) throw new Error(`Producto con id ${data.productoId} no encontrado`);
if (!producto.activo) throw new Error(`El producto "${producto.nombre}" está inactivo`);

const duplicado = await prisma.variante.findFirst({
    where: {
    productoId: data.productoId,
    color: { equals: data.color, mode: "insensitive" },
    },
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
});
};

// ─── UPDATE ──────────────────────────────────────────

export const updateVariante = async (
id: number,
data: UpdateVarianteDto
): Promise<Variante> => {
const variante = await prisma.variante.findUnique({ where: { id } });
if (!variante) throw new Error(`Variante con id ${id} no encontrada`);

if (data.color) {
    const duplicado = await prisma.variante.findFirst({
    where: {
        id: { not: id },
        productoId: variante.productoId,
        color: { equals: data.color, mode: "insensitive" },
    },
    });

    if (duplicado) {
    throw new Error(`Ya existe otra variante de color "${data.color}" para este producto`);
    }
}

if (data.stock !== undefined && data.stock < 0) {
    throw new Error("El stock no puede ser negativo");
}

return prisma.variante.update({ where: { id }, data });
};

// ─── AJUSTAR STOCK ───────────────────────────────────

export const ajustarStock = async (id: number, cantidad: number): Promise<Variante> => {
const variante = await prisma.variante.findUnique({ where: { id } });
if (!variante) throw new Error(`Variante con id ${id} no encontrada`);

const nuevoStock = variante.stock + cantidad;
if (nuevoStock < 0) {
    throw new Error(
    `Stock insuficiente. Stock actual: ${variante.stock}, ajuste solicitado: ${cantidad}`
    );
}

return prisma.variante.update({
    where: { id },
    data: { stock: nuevoStock },
});
};

// ─── DELETE ──────────────────────────────────────────

export const deleteVariante = async (id: number): Promise<Variante> => {
const variante = await prisma.variante.findUnique({
    where: { id },
    include: { itemsPedido: true, itemsVenta: true },
});

if (!variante) throw new Error(`Variante con id ${id} no encontrada`);

const tieneMovimientos =
    (variante as any).itemsPedido?.length > 0 ||
    (variante as any).itemsVenta?.length > 0;

if (tieneMovimientos) {
    throw new Error(
    "No se puede eliminar: la variante tiene pedidos o ventas asociadas"
    );
}

return prisma.variante.delete({ where: { id } });
};