/// Es la página que muestra el listado de productos (cuando haces clic en "Bolsos", "Maquillaje", etc.).
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { MOCK_PRODUCTS } from '../../../mockData';
import { ProductCategory } from '../../../types';
import styles from '../css/Collection.module.css';

export const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories: (ProductCategory | 'all')[] = ['all', 'tote', 'clutch', 'crossbody', 'mini', 'shopper'];

  const filteredProducts = useMemo(() => {
    let result = MOCK_PRODUCTS;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    return result;
  }, [selectedCategory, searchQuery]);

  const clearSearch = () => {
    setSearchParams({});
  };

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>
            {searchQuery ? (
              <span className={styles.searchResultTitle}>
                Búsqueda: <span className={styles.queryHighlight}>"{searchQuery}"</span>
                <button onClick={clearSearch} className={styles.clearSearchBtn} title="Limpiar búsqueda">
                  <X size={16} />
                </button>
              </span>
            ) : (
              'Colección'
            )}
            <span className={styles.count}>{filteredProducts.length} piezas</span>
          </h1>
          
          <button className={styles.filterToggle} onClick={() => setIsFilterOpen(true)}>
            Filtros <Filter size={16} />
          </button>
        </header>

        {/* Categories Bar Desktop */}
        <div className={styles.categoriesBar}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.catBtn} ${selectedCategory === cat ? styles.active : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'Ver todo' : cat}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>

      {/* Filter Sidebar Mobile */}
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
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        className={`${styles.sidebarOpt} ${selectedCategory === cat ? styles.activeOpt : ''}`}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsFilterOpen(false);
                        }}
                      >
                        {cat === 'all' ? 'Todas' : cat}
                      </button>
                    ))}
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
