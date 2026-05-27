import { PrismaClient, Categoria } from "@prisma/client";

const prisma = new PrismaClient();

///LO QUE RECIBO DEL REQUEST
export interface CreateCategoriaDto {
nombre: string;
slug: string;
imagen?: string;
}

export interface UpdateCategoriaDto {
nombre?: string;
slug?: string;
imagen?: string;
}

// ─── OBTENER ────────────────────────────────────────────


export const getAllCategorias = async (): Promise<Categoria[]> => {
return prisma.categoria.findMany({
    orderBy: { creadoEn: "desc" },
});
};

export const getCategoriaById = async (id: number): Promise<Categoria | null> => {
return prisma.categoria.findUnique({
    where: { id },
    include: { productos: true },
});
};

export const getCategoriaBySlug = async (slug: string): Promise<Categoria | null> => {
return prisma.categoria.findUnique({
    where: { slug },
    include: { productos: true },
});
};


// ─── CREAR ──────────────────────────────────────────

export const createCategoria = async (data: CreateCategoriaDto): Promise<Categoria> => {
const existe = await prisma.categoria.findFirst({
    where: {
    OR: [{ nombre: data.nombre }, { slug: data.slug }],
    },
});

if (existe) {
    throw new Error(
    existe.nombre === data.nombre
        ? `Ya existe una categoría con el nombre "${data.nombre}"`
        : `Ya existe una categoría con el slug "${data.slug}"`
    );
}

return prisma.categoria.create({ data });
};


// ─── ACTUALIZAR ──────────────────────────────────────────
export const updateCategoria = async (
id: number,
data: UpdateCategoriaDto
): Promise<Categoria> => {
const categoria = await prisma.categoria.findUnique({ where: { id } });
if (!categoria) throw new Error(`Categoría con id ${id} no encontrada`);

if (data.nombre || data.slug) {
const duplicado = await prisma.categoria.findFirst({
    where: {
        AND: [
        { id: { not: id } },
        {
            OR: [
            ...(data.nombre ? [{ nombre: data.nombre }] : []),
            ...(data.slug ? [{ slug: data.slug }] : []),
            ],
        },
        ],
    },
    });

    if (duplicado) {
    throw new Error(
        duplicado.nombre === data.nombre
        ? `Ya existe otra categoría con el nombre "${data.nombre}"`
        : `Ya existe otra categoría con el slug "${data.slug}"`
    );
    }
}

return prisma.categoria.update({ where: { id }, data });
};


// ─── ELIMINAR ──────────────────────────────────────────

export const deleteCategoria = async (id: number): Promise<Categoria> => {
const categoria = await prisma.categoria.findUnique({
    where: { id },
    include: { productos: true },
});

if (!categoria) throw new Error(`Categoría con id ${id} no encontrada`);

const productosActivos = (categoria as any).productos?.filter((p: any) => p.activo);
if (productosActivos?.length > 0) {
    throw new Error(
    `No se puede eliminar: la categoría tiene ${productosActivos.length} producto(s) activo(s)`
    );
}

return prisma.categoria.delete({ where: { id } });
};