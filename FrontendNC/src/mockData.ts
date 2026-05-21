///base de datos de prueba 

import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
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
  },
  {
    id: '6',
    slug: 'mini-monaco-noir',
    name: 'Mini Mónaco',
    price: 260000,
    category: 'mini',
    colors: [
      { name: 'Noir', hex: '#000000' }
    ],
    material: 'Sintético Premium',
    description: 'Un toque de sofisticación europea.',
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: false,
    isSoldOut: true,
    isFeatured: true,
    tags: ['Exclusivo']
  },
  {
    id: '7',
    slug: 'tote-arena',
    name: 'Tote Arena',
    price: 340000,
    category: 'tote',
    colors: [
      { name: 'Arena', hex: '#D2B48C' }
    ],
    material: 'Lino y Cuero',
    description: 'Texturas naturales para días soleados.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: true,
    isSoldOut: false,
    isFeatured: false,
    tags: ['Verano']
  },
  {
    id: '8',
    slug: 'clutch-diamante',
    name: 'Clutch Diamante',
    price: 210000,
    category: 'clutch',
    colors: [
      { name: 'Cristal', hex: '#F0FFFF' }
    ],
    material: 'Acrílico Tallado',
    description: 'Luz propia en cada evento.',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: false,
    isSoldOut: false,
    isFeatured: false,
    tags: ['Fiesta']
  },
  {
    id: '9',
    slug: 'crossbody-velvet',
    name: 'Crossbody Velvet',
    price: 275000,
    category: 'crossbody',
    colors: [
      { name: 'Vino', hex: '#800000' },
      { name: 'Esmeralda', hex: '#50C878' }
    ],
    material: 'Terciopelo',
    description: 'Suavidad y carácter.',
    images: [
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: true,
    isSoldOut: false,
    isFeatured: false,
    tags: ['Textura']
  },
  {
    id: '10',
    slug: 'shopper-basico-xl',
    name: 'Shopper Básico XL',
    price: 310000,
    category: 'shopper',
    colors: [
      { name: 'Miel', hex: '#EBA937' }
    ],
    material: 'Cuero Vegano',
    description: 'Tu compañero incansable.',
    images: [
      'https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: false,
    isSoldOut: false,
    isFeatured: false,
    tags: ['Esencial']
  },
  {
    id: '11',
    slug: 'mini-perla',
    name: 'Mini Perla',
    price: 240000,
    category: 'mini',
    colors: [
      { name: 'Perla', hex: '#FDF5E6' }
    ],
    material: 'Satín',
    description: 'Pequeños detalles que cuentan.',
    images: [
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: true,
    isSoldOut: false,
    isFeatured: true,
    tags: ['Boda', 'Elegante']
  },
  {
    id: '12',
    slug: 'tote-urbano',
    name: 'Tote Urbano',
    price: 360000,
    category: 'tote',
    colors: [
      { name: 'Gris Grafito', hex: '#36454F' }
    ],
    material: 'Lona de Alta Densidad',
    description: 'Resistencia con estilo citadino.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800'
    ],
    isNew: false,
    isSoldOut: false,
    isFeatured: false,
    tags: ['Urbano']
  }
];
