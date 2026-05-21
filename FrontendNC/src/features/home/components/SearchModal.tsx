//Buscar Modal
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { useUIStore } from '../../store/pages/uiStore';
import { MOCK_PRODUCTS } from '../../../mockData';
import { Product } from '../../../types';
import styles from '../css/SearchModal.module.css';

export const SearchModal = () => {
  const { isSearchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when search is opened
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  // Reactive live search filtering
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = MOCK_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    ).slice(0, 5); // Max 5 suggested products

    setResults(filtered);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Redirect to /coleccion with search term query parameter
    navigate(`/coleccion?search=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  const handleSelectProduct = (slug: string) => {
    navigate(`/producto/${slug}`);
    setSearchOpen(false);
  };

  const handleClose = () => {
    setSearchOpen(false);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Search Dropdown Panel from Top */}
          <motion.div
            className={styles.searchPanel}
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          >
            <div className={styles.container}>
              <div className={styles.header}>
                <span className={styles.brand}>NC STORE</span>
                <button className={styles.closeBtn} onClick={handleClose} aria-label="Cerrar búsqueda">
                  <X size={24} />
                </button>
              </div>

              {/* Main Search Input Form */}
              <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <Search className={styles.searchIcon} size={24} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="¿Qué estás buscando hoy? (ej. Bolso, Mini, Tote...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {query && (
                  <button type="button" className={styles.clearBtn} onClick={() => setQuery('')}>
                    Limpiar
                  </button>
                )}
              </form>

              {/* Live Results Panel */}
              <div className={styles.resultsArea}>
                {results.length > 0 ? (
                  <div className={styles.suggestions}>
                    <h3 className={styles.sectionTitle}>Sugerencias de productos</h3>
                    <div className={styles.resultsGrid}>
                      {results.map((product) => (
                        <div
                          key={product.id}
                          className={styles.productCard}
                          onClick={() => handleSelectProduct(product.slug)}
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className={styles.productImg}
                          />
                          <div className={styles.productInfo}>
                            <h4 className={styles.productName}>{product.name}</h4>
                            <span className={styles.productPrice}>
                              ${product.price.toLocaleString('es-CO')}
                            </span>
                            <span className={styles.productCategory}>{product.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="submit" onClick={handleSearchSubmit} className={styles.viewAllBtn}>
                      Ver todos los resultados para "{query}"
                    </button>
                  </div>
                ) : query.trim() ? (
                  <div className={styles.noResults}>
                    <ShoppingBag size={40} className={styles.noResultsIcon} />
                    <p>No encontramos productos para "{query}"</p>
                    <p className={styles.noResultsSub}>Intenta con otros términos como "Tote", "Mini" o "Medellín"</p>
                  </div>
                ) : (
                  <div className={styles.popularSearches}>
                    <h3 className={styles.sectionTitle}>Búsquedas populares</h3>
                    <div className={styles.tagsContainer}>
                      {['Tote', 'Mini Bogotá', 'Clutch', 'Puffer', 'Bolsos', 'Maquillaje'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={styles.popularTag}
                          onClick={() => setQuery(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
