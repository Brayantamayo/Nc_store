// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_PRODUCTS = [
  {
    slug: 'bolso-canela-tote',
    name: 'Bolso Canela',
    price: 380000,
    category: 'tote',
    colors: [
      { name: 'Canela', hex: '#8B4513' },
      { name: 'Negro', hex: '#000000' }
    ],
    material: 'Cuero Vegano',
    description: 'Un tote clásico reinventado para la mujer moderna. Espacioso, elegante y con la actitud de NC.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: true,
    isSoldOut: false,
    isFeatured: false,
    tags: ['Elegante', 'Diario']
  },
  {
    slug: 'mini-bogota-rose',
    name: 'Mini Bogotá Rose',
    price: 220000,
    category: 'mini',
    colors: [
      { name: 'Rose', hex: '#F4C2C2' },
      { name: 'Blanco', hex: '#FFFFFF' }
    ],
    material: 'Sintético Premium',
    description: 'La joya de la corona. Pequeño en tamaño, gigante en estilo.',
    images: [
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1566150905458-1bf1fd111c06?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: false,
    isSoldOut: false,
    isFeatured: true,
    tags: ['Tendencia', 'Mini']
  },
  {
    slug: 'clutch-medellin-noche',
    name: 'Clutch Medellín',
    price: 180000,
    category: 'clutch',
    colors: [
      { name: 'Esmalte', hex: '#E5E4E2' },
      { name: 'Dorado', hex: '#D4AF37' }
    ],
    material: 'Acrílico',
    description: 'Perfecto para las noches de la ciudad eterna.',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1598048145816-3687be683b51?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: true,
    isSoldOut: false,
    isFeatured: false,
    tags: ['Noche', 'Gala']
  },
  {
    slug: 'crossbody-luna-crema',
    name: 'Crossbody Luna',
    price: 290000,
    category: 'crossbody',
    colors: [
      { name: 'Crema', hex: '#FFFDD0' },
      { name: 'Terracota', hex: '#E2725B' }
    ],
    material: 'Cuero Genuino',
    description: 'Versatilidad y elegancia en cada paso.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: false,
    isSoldOut: false,
    isFeatured: false,
    tags: ['Casual', 'Viaje']
  },
  {
    slug: 'shopper-estelar',
    name: 'Shopper Estelar',
    price: 450000,
    category: 'shopper',
    colors: [
      { name: 'Plata', hex: '#C0C0C0' },
      { name: 'Azul Noche', hex: '#000080' }
    ],
    material: 'Cuero Metalizado',
    description: 'Para la mujer que lo lleva todo.',
    images: [
      'https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: true,
    isSoldOut: false,
    isFeatured: false,
    tags: ['Maxi', 'Oficina']
  }
];

async function main() {
  console.log('🌱 Start seeding...');

  // Clean existing tables in correct order
  await prisma.productImage.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.product.deleteMany();

  for (const item of MOCK_PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        slug: item.slug,
        name: item.name,
        price: item.price,
        category: item.category,
        material: item.material,
        description: item.description,
        isNew: item.isNew,
        isSoldOut: item.isSoldOut,
        isFeatured: item.isFeatured,
        images: {
          create: item.images.map((url) => ({ url }))
        },
        colors: {
          create: item.colors.map((col) => ({ name: col.name, hex: col.hex }))
        },
        tags: {
          create: item.tags.map((name) => ({ name }))
        }
      }
    });
    console.log(`Created product: ${product.name} (${product.slug})`);
  }

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
