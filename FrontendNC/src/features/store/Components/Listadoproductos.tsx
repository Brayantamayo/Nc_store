import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { productoService } from '../../productos/services/productoService';
import { categoriaService } from '../../categoria/services/categoriaService';
import type { CategoriaTreeItem } from '../../categoria/types';
import type { ProductoApiItem } from '../../productos/types';
import type { Product } from '../../../types';
import { Bow } from '../../home/components/Moñito';
import styles from '../css/Collection.module.css';

const colorMap: Record<string, string> = {
  negro: '#000000',
  blanco: '#FFFFFF',
  rosado: '#E91E8C',
  rosa: '#E91E8C',
  rojo: '#FF0000',
  azul: '#0066FF',
  verde: '#00AA00',
  amarillo: '#FFFF00',
  naranja: '#FF8800',
  morado: '#9933FF',
  gris: '#808080',
  beige: '#D4BCA8',
  cafe: '#8B4513',
  marron: '#8B4513',
};

interface CategoryMetadata {
  name: string;
  description: string;
  image: string;
}

const SPECIAL_CATEGORIES: Record<string, CategoryMetadata> = {
  descuentos: {
    name: 'Ofertas Especiales',
    description: 'Nuestras piezas de colección más deseadas con precios especiales por tiempo limitado.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600',
  },
  all: {
    name: 'Toda la Colección',
    description: 'Explora el catálogo completo de NC Store. Expresión, elegancia y tendencia coquette.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600',
  },
};

const getColorHex = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || '#808080';
};

const collectSlugs = (category: CategoriaTreeItem): string[] => {
  const slugs = [category.slug.toLowerCase()];
  category.children.forEach((child) => {
    slugs.push(...collectSlugs(child));
  });
  return slugs;
};

export const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = (searchParams.get('category') || 'all').toLowerCase();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [dbProducts, setDbProducts] = useState<ProductoApiItem[]>([]);
  const [dbCategories, setDbCategories] = useState<CategoriaTreeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productoService.listarParaTienda(1, 100),
          categoriaService.arbol(),
        ]);
        setDbProducts(prodRes.data);
        setDbCategories(catRes);
      } catch (error) {
        console.error('Error fetching storefront data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  const rootCategories = useMemo(() => dbCategories.filter((cat) => !cat.parentId), [dbCategories]);

  const categoryBySlug = useMemo(() => {
    const map = new Map<string, CategoriaTreeItem>();
    const walk = (category: CategoriaTreeItem) => {
      map.set(category.slug.toLowerCase(), category);
      category.children.forEach(walk);
    };
    dbCategories.forEach(walk);
    return map;
  }, [dbCategories]);

  const categories = useMemo(() => {
    const defaults = ['all', ...rootCategories.map((cat) => cat.slug.toLowerCase())];
    if (!defaults.includes('descuentos')) {
      defaults.push('descuentos');
    }
    return defaults;
  }, [rootCategories]);

  const mappedProducts = useMemo<Product[]>(() => {
    return dbProducts
      .map((p) => {
        const activeVariantes = p.variantes?.filter((v) => ('activo' in v ? v.activo : true)) || [];
        const variantImages = activeVariantes.flatMap((v) => v.imagenes) || [];
        const images = variantImages.length > 0
          ? variantImages
          : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'];

        const colors = activeVariantes
          ?.filter((v): v is typeof v & { color: string } => 'color' in v && !!v.color)
          .map((v) => ({
            name: v.color,
            hex: getColorHex(v.color),
          })) || [];

        return {
          id: String(p.id),
          slug: p.slug,
          name: p.nombre,
          price: Number(p.precio),
          originalPrice: p.precioOriginal ? Number(p.precioOriginal) : undefined,
          images,
          category: p.categoria.slug.toLowerCase() as any,
          colors,
          material: '',
          description: p.descripcion || '',
          isNew: false,
          isSoldOut: !activeVariantes || activeVariantes.length === 0 || !activeVariantes.some((v) => (v as any).stock > 0),
          isFeatured: false,
          tags: [],
        };
      })
      .filter((p) => !p.isSoldOut);
  }, [dbProducts]);

  const filteredProducts = useMemo(() => {
    let result = mappedProducts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
      );
    }

    if (categoryParam === 'descuentos') {
      result = result.filter((p) => !!(p.originalPrice && p.originalPrice > p.price));
      return result;
    }

    if (categoryParam !== 'all') {
      const activeCategory = categoryBySlug.get(categoryParam);
      if (activeCategory) {
        const accepted = new Set(collectSlugs(activeCategory));
        result = result.filter((p) => accepted.has(p.category.toLowerCase()));
      } else {
        result = result.filter((p) => p.category === categoryParam);
      }
    }

    return result;
  }, [categoryBySlug, categoryParam, mappedProducts, searchQuery]);

  const clearSearch = () => {
    setSearchParams({});
  };

  const activeDbCategory = categoryBySlug.get(categoryParam);

  const currentMeta = useMemo(() => {
    const meta = SPECIAL_CATEGORIES[categoryParam] || SPECIAL_CATEGORIES.all;
    const name = activeDbCategory ? activeDbCategory.nombre : meta.name;
    const description = meta.description || `Explora nuestra exclusiva selección de ${name} con la esencia NC Store.`;

    let image = meta.image || SPECIAL_CATEGORIES.all.image;
    if (activeDbCategory?.imagen && activeDbCategory.imagen.trim()) {
      const trimmedImage = activeDbCategory.imagen.trim();
      if (trimmedImage.startsWith('http') || trimmedImage.startsWith('data:')) {
        image = trimmedImage;
      }
    }

    return { name, description, image };
  }, [activeDbCategory, categoryParam]);

  const renderCategoryButton = (slug: string, label: string) => (
    <button
      key={slug}
      className={`${styles.catBtn} ${categoryParam === slug ? styles.active : ''}`}
      onClick={() => setSearchParams({ category: slug })}
    >
      {label}
    </button>
  );

  const renderSidebarCategory = (category: CategoriaTreeItem, level = 0) => (
    <div key={category.id} style={{ marginLeft: level > 0 ? '0.75rem' : 0 }}>
      <button
        className={`${styles.sidebarOpt} ${categoryParam === category.slug.toLowerCase() ? styles.activeOpt : ''}`}
        onClick={() => {
          setSearchParams({ category: category.slug.toLowerCase() });
          setIsFilterOpen(false);
        }}
        style={{
          width: '100%',
          textAlign: 'left',
          paddingLeft: level > 0 ? '1.15rem' : undefined,
        }}
      >
        {category.nombre}
        {category.children.length > 0 ? ` (${category.children.length})` : ''}
      </button>
      {category.children.length > 0 && (
        <div style={{ marginTop: '0.35rem', marginBottom: '0.5rem' }}>
          {category.children.map((child) => renderSidebarCategory(child, level + 1))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#db2777' }}>
        <span>Cargando colección...</span>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <section className={styles.hero}>
        <div
          className={styles.heroImage}
          style={{ backgroundImage: `url(${currentMeta.image})` }}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <motion.p
            className={styles.heroKicker}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Bow size={12} color="rgba(255,245,248,0.9)" />
            Colección NC Store
          </motion.p>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {currentMeta.name}
          </motion.h1>
          <motion.p
            className={styles.heroDesc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {currentMeta.description}
          </motion.p>
        </div>
        <div className={styles.heroCurve} aria-hidden="true" />
      </section>

      <div className={`container ${styles.contentShell}`}>
        <div className={styles.introBlock}>
          <p className={styles.introKicker}>
            {searchQuery ? 'Resultados' : 'Curaduría coquette'}
          </p>
          <h2 className={styles.introTitle}>
            {searchQuery ? (
              <span className={styles.searchResultTitle}>
                "{searchQuery}"
                <button onClick={clearSearch} className={styles.clearSearchBtn} title="Limpiar búsqueda">
                  <X size={16} />
                </button>
              </span>
            ) : (
              currentMeta.name
            )}
          </h2>
          <div className={styles.sparkleDivider} aria-hidden="true">
            <span />
            <i />
            <span />
          </div>
          <p className={styles.introCount}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'pieza encontrada' : 'piezas encontradas'}
          </p>
        </div>

        <header className={styles.header}>
          <button className={styles.filterToggle} onClick={() => setIsFilterOpen(true)}>
            Filtros <Filter size={16} />
          </button>
        </header>

        <div className={styles.categoriesBar}>
          {categories.map((cat) => {
            const label = cat === 'all'
              ? 'Ver todo'
              : (categoryBySlug.get(cat)?.nombre || cat);
            return renderCategoryButton(cat, label);
          })}
        </div>

        <div className={styles.grid}>
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>Sin piezas por ahora</h3>
              <p>
                {searchQuery
                  ? 'No encontramos productos con esa búsqueda. Prueba otro término o explora otra categoría.'
                  : 'Esta categoría aún no tiene productos disponibles. Mientras tanto, explora el resto de la colección.'}
              </p>
            </div>
          ) : (
            filteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} variant="collection" />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              className={styles.filterSidebar}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.4 }}
            >
              <div className={styles.sidebarHeader}>
                <h2>FILTRAR</h2>
                <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
              </div>
              <div className={styles.sidebarContent}>
                <div className={styles.filterSection}>
                  <h3>Categoría</h3>
                  <div className={styles.sidebarOptions}>
                    <button
                      className={`${styles.sidebarOpt} ${categoryParam === 'all' ? styles.activeOpt : ''}`}
                      onClick={() => {
                        setSearchParams({});
                        setIsFilterOpen(false);
                      }}
                    >
                      Todas
                    </button>

                    {rootCategories.map((category) => (
                      <div key={category.id}>
                        {renderSidebarCategory(category)}
                      </div>
                    ))}

                    <button
                      className={`${styles.sidebarOpt} ${categoryParam === 'descuentos' ? styles.activeOpt : ''}`}
                      onClick={() => {
                        setSearchParams({ category: 'descuentos' });
                        setIsFilterOpen(false);
                      }}
                    >
                      Descuentos
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
