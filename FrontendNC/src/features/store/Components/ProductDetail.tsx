///Es la pagina donde se ve un solo 
// producto a detalle con su precio y descripcion.
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Heart, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, Truck, X } from 'lucide-react';
import { toast } from 'sonner';

import { useProductStore } from '../pages/productStore';
import { useCartStore } from '../pages/cartStore';
import { useFlyToCartStore } from '../pages/flyToCartStore';
import { useCartFeedbackStore } from '../pages/cartFeedbackStore';
import { useWishlistStore } from '../pages/wishlistStore';
import { productoService } from '../../productos/services/productoService';
import { BRAND_PLACEHOLDER_IMAGE } from '../../../types';
import type { ColorOption, Product } from '../../../types';
import type { ProductoDetailItem } from '../../productos/types';

import { ProductCard } from './ProductCard';

import styles from '../css/ProductDetail.module.css';

// Mapeo de nombres de colores a códigos hex — incluye variaciones comunes
const colorMap: { [key: string]: string } = {
  negro: '#1a1a1a', blanco: '#f5f5f5', gris: '#9e9e9e', 'gris claro': '#d0d0d0',
  rosado: '#f48fb1', rosa: '#f48fb1', 'rosa fucsia': '#e91e8c', fucsia: '#e91e8c',
  rojo: '#e53935', coral: '#ff7043', naranja: '#fb8c00', amarillo: '#fdd835',
  verde: '#43a047', 'verde menta': '#80cbc4', azul: '#1e88e5', 'azul cielo': '#81d4fa',
  morado: '#8e24aa', lavanda: '#ce93d8', beige: '#d7b899', café: '#6d4c41',
  cafe: '#6d4c41', dorado: '#ffd54f', plateado: '#b0bec5', nude: '#e8c4a0',
  marron: '#8B4513', marrón: '#8B4513',
};

const getColorHex = (colorName: string, index = 0): string => {
  const trimmed = colorName.trim();
  // 1. Si ya es un hex válido → usarlo directamente
  if (/^#[0-9a-fA-F]{3,6}$/.test(trimmed)) return trimmed;
  // 2. Buscar por nombre exacto
  const normalized = trimmed.toLowerCase();
  if (colorMap[normalized]) return colorMap[normalized];
  // 3. Búsqueda parcial
  const partial = Object.keys(colorMap).find((k) => normalized.includes(k) || k.includes(normalized));
  if (partial) return colorMap[partial];
  // 4. Fallback rotativo
  const fallbacks = ['#c2185b', '#f48fb1', '#1a1a1a', '#f5f5f5', '#9e9e9e', '#fb8c00'];
  return fallbacks[index % fallbacks.length];
};


export const ProductDetail = () => {
  const { products: storeProducts } = useProductStore();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const triggerFly = useFlyToCartStore((s) => s.triggerFly);
  const showSuccess = useCartFeedbackStore((s) => s.showSuccess);
  const { toggle, isWishlisted } = useWishlistStore();
  const mainImageRef = useRef<HTMLImageElement>(null);

  const [product, setProduct] = useState<Product | null>(() => {
    return storeProducts.find((p) => p.slug === slug) || null;
  });
  const [imagenPrincipal, setImagenPrincipal] = useState<string | null>(() => {
    const local = storeProducts.find((p) => p.slug === slug);
    return local?.images[0] || null;
  });
  const [apiVariantes, setApiVariantes] = useState<ProductoDetailItem['variantes']>([]);
  const [loading, setLoading] = useState(() => {
    return !storeProducts.some((p) => p.slug === slug);
  });
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(() => {
    const local = storeProducts.find((p) => p.slug === slug);
    return local?.colors?.[0] || null;
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [comboSelections, setComboSelections] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [relatedStartIndex, setRelatedStartIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setIsLeaving(false);
    // Buscar copia local para mostrar inmediatamente si cambia el slug
    const local = storeProducts.find((p) => p.slug === slug);
    if (local) {
      setProduct(local);
      setImagenPrincipal(local.images[0] || null);
      setSelectedColor((current) => {
        if (current && local.colors?.some((c) => c.name === current.name)) {
          return current;
        }
        return local.colors?.[0] || null;
      });
      setLoading(false);
    } else {
      setLoading(true);
    }

    const loadProduct = async () => {
      if (!slug) return;
      try {
        const apiProduct = await productoService.obtenerPorSlugParaTienda(slug);
        const availableVariantes = apiProduct.variantes.filter((v) => v.stock > 0);

        setApiVariantes(availableVariantes);
        setImagenPrincipal(apiProduct.imagenPrincipal ?? null);

        // product.images = [imagenPrincipal] — solo la imagen del producto
        // Las imágenes de variantes se cargan dinámicamente al seleccionar color
        const imgPrincipal = apiProduct.imagenPrincipal;
        const fallback = BRAND_PLACEHOLDER_IMAGE;

        const images = imgPrincipal
          ? [imgPrincipal]
          : availableVariantes[0]?.imagenes?.length
            ? availableVariantes[0].imagenes
            : [fallback];

        const colors = availableVariantes.map((v, i) => {
          const parts = v.color.split('|');
          if (parts.length === 2) {
            return {
              name: parts[0].trim(),
              hex: parts[1].trim(),
              varianteId: v.id,
            };
          }
          return {
            name: v.color,
            hex: getColorHex(v.color, i),
            varianteId: v.id,
          };
        });

        const transformedProduct: Product = {
          id: String(apiProduct.id),
          slug: apiProduct.slug,
          name: apiProduct.nombre,
          price: Number(apiProduct.precio),
          originalPrice: apiProduct.precioOriginal ? Number(apiProduct.precioOriginal) : undefined,
          images,
          category: apiProduct.categoria?.slug?.toLowerCase() as any || 'general',
          colors,
          material: '',
          description: apiProduct.descripcion || '',
          isNew: false,
          isSoldOut: availableVariantes.length === 0,
          isFeatured: false,
          tags: [],
          esCombo: apiProduct.esCombo ?? false,
          opcionesCombo: apiProduct.opcionesCombo ?? [],
        };

        setProduct(transformedProduct);
        setSelectedColor((current) => {
          if (current && colors.some((c) => c.name === current.name)) {
            return current;
          }
          return colors[0] || null;
        });
        setSelectedImageIndex(0);
      } catch (error) {
        console.error('Error loading product:', error);
        if (!local) {
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, storeProducts]);

  // Imágenes según el color seleccionado:
  // - Si la variante tiene fotos propias → las muestra
  // - Si no → muestra la imagenPrincipal del producto
  // - Si no hay ninguna → fallback de unsplash
  const getColorImages = (): string[] => {
    const fallback = imagenPrincipal
      ? [imagenPrincipal]
      : product?.images ?? [];

    if (!selectedColor) return fallback;

    const variant = apiVariantes.find((v) => {
      if (selectedColor.varianteId && v.id === selectedColor.varianteId) return true;
      const vName = v.color.split('|')[0].trim().toLowerCase();
      const selName = selectedColor.name.split('|')[0].trim().toLowerCase();
      return vName === selName;
    });
    if (variant && variant.imagenes.length > 0) return variant.imagenes;

    return fallback;
  };

  const colorImages = getColorImages();
  const currentVariant = selectedColor
    ? apiVariantes.find((v) => {
        if (selectedColor.varianteId && v.id === selectedColor.varianteId) return true;
        const vName = v.color.split('|')[0].trim().toLowerCase();
        const selName = selectedColor.name.split('|')[0].trim().toLowerCase();
        return vName === selName;
      })
    : undefined;
  const currentStock = currentVariant?.stock ?? 0;

  useEffect(() => {
    if (currentStock <= 0) return;
    setQuantity((current) => Math.min(Math.max(1, current), currentStock));
  }, [currentStock, selectedColor]);

  const handleColorChange = (color: any) => {
    setSelectedColor(color);
    setSelectedImageIndex(0);
  };

  const handleQuantityChange = (value: string) => {
    if (value === '') {
      setQuantity(0);
      return;
    }
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      return;
    }

    if (currentStock > 0) {
      setQuantity(Math.min(Math.max(0, parsed), currentStock));
      return;
    }

    setQuantity(Math.max(0, parsed));
  };

  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/coleccion');
      }
    }, 400);
  };

  const relatedProducts = storeProducts
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);
  const curatedProducts = product
    ? (relatedProducts.length > 0
      ? relatedProducts
      : storeProducts.filter((p) => p.id !== product.id).slice(0, 4))
    : [];
  const activeWishlist = product ? isWishlisted(product.id) : false;
  const hasDiscount = Boolean(product && product.originalPrice && product.originalPrice > product.price);
  const amountSaved = hasDiscount && product ? product.originalPrice! - product.price : 0;
  const primaryImage = colorImages[selectedImageIndex] ?? colorImages[0];
  const rotatingProducts = curatedProducts.length > 0 ? curatedProducts : [];
  const visibleRelatedProducts = rotatingProducts.length <= 4
    ? rotatingProducts
    : Array.from({ length: 4 }, (_, index) => rotatingProducts[(relatedStartIndex + index) % rotatingProducts.length]);

  useEffect(() => {
    if (rotatingProducts.length <= 4) return undefined;

    const interval = window.setInterval(() => {
      setRelatedStartIndex((current) => (current + 1) % rotatingProducts.length);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [rotatingProducts.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    setDragOffset(diffX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (trackRef.current) {
      const scrollContainer = trackRef.current.parentElement;
      if (scrollContainer) {
        scrollContainer.scrollBy({
          left: -dragOffset,
          behavior: 'smooth'
        });
      }
    }
    setDragOffset(0);
  };


  if (loading) {
    return (
      <div className={styles.loadingOverlay} style={{ position: 'relative', height: '60vh', background: 'transparent', backdropFilter: 'none' }}>
        <div className={styles.spinner} />
        <p style={{ color: '#c2185b', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.1em' }}>CARGANDO PRODUCTO...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section">
        <p>Producto no encontrado</p>
        <button onClick={() => navigate('/coleccion')}>Volver a la coleccion</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.isSoldOut) {
      toast.error('Este producto esta agotado por ahora.');
      return;
    }

    if (!product.esCombo && !selectedColor) {
      toast.error('Selecciona un color antes de agregarlo al carrito.');
      return;
    }

    if (product.esCombo && product.opcionesCombo) {
      const unselected = product.opcionesCombo.filter(opt => !comboSelections[opt]);
      if (unselected.length > 0) {
        toast.error(`Selecciona el color para: ${unselected.join(', ')}`);
        return;
      }
    }

    // Check available stock
    const availableStock = currentStock;

    const purchaseQty = quantity <= 0 ? 1 : quantity;

    if (purchaseQty > availableStock) {
      toast.error(`No hay stock suficiente por el momento. Podemos brindarte ${availableStock} unidad${availableStock === 1 ? '' : 'es'}.`);
      if (availableStock > 0) {
        setQuantity(availableStock);
      }
      return;
    }

    const source = mainImageRef.current;
    if (source) {
      triggerFly(colorImages[0], source);
    }

    for (let i = 0; i < purchaseQty; i++) {
      addItem(product, selectedColor || product.colors[0], availableStock, product.esCombo ? comboSelections : undefined);
    }

    showSuccess({ productName: product.name, quantity: purchaseQty });
  };

  return (
    <motion.div className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="container">
        <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="Volver">
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
        <div className={styles.layout}>
          <div className={styles.gallery}>
            <div className={styles.galleryFrame}>
              <div className={styles.galleryHeader}>
                <span className={styles.galleryBadge}>
                  {product.isSoldOut ? 'Pieza agotada' : 'Seleccion exclusiva NC'}
                </span>
                <span className={styles.galleryCounter}>
                  {String(selectedImageIndex + 1).padStart(2, '0')} / {String(colorImages.length).padStart(2, '0')}
                </span>
              </div>

              <div 
                className={styles.mainImageWrapper} 
                onClick={() => setIsModalOpen(true)}
                style={{ cursor: 'zoom-in' }}
                title="Hacer clic para ampliar"
              >
                <img ref={mainImageRef} src={primaryImage} alt={product.name} className={styles.mainImage} />
              </div>
            </div>

            {colorImages.length > 1 && (
              <div className={styles.thumbnails}>
                {colorImages.map((img, idx) => (
                  <button
                    key={`${product.id}-${idx}`}
                    type="button"
                    className={`${styles.thumbWrapper} ${selectedImageIndex === idx ? styles.thumbWrapperActive : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Ver imagen ${idx + 1} de ${product.name}`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className={styles.thumb} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.infoShell}>
              <div className={styles.infoTop}>
                <div>
                  <p className={styles.category}>{product.category}</p>
                  <h1 className={styles.name}>{product.name}</h1>
                </div>

                <button
                  type="button"
                  className={`${styles.wishlistBtn} ${activeWishlist ? styles.activeWish : ''}`}
                  onClick={() => toggle(product)}
                  aria-label={activeWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart size={20} fill={activeWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className={styles.metaRow}>
                <span className={styles.statusPill}>
                  {product.isSoldOut ? 'Agotado' : product.isNew ? 'Nuevo lanzamiento' : 'Disponible'}
                </span>
                {product.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className={styles.tagPill}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className={styles.priceBlock}>
                <div className={styles.priceRow}>
                  <p className={styles.price}>
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      maximumFractionDigits: 0,
                    }).format(product.price)}
                  </p>
                  {hasDiscount && (
                    <p className={styles.originalPrice}>
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 0,
                      }).format(product.originalPrice!)}
                    </p>
                  )}
                </div>
                {hasDiscount && <p className={styles.savings}>Ahorras {new Intl.NumberFormat('es-CO').format(amountSaved)}</p>}
              </div>

              <div className={styles.descriptionCard}>
                <p>{product.description}</p>
              </div>

              <div className={styles.purchasePanel}>
                {product.esCombo && product.opcionesCombo && product.opcionesCombo.length > 0 ? (
                  <div className={styles.comboSelectors}>
                    <p className={styles.label} style={{ marginBottom: '1rem', fontWeight: 600 }}>Personaliza tu Combo</p>
                    {product.opcionesCombo.map((opt) => {
                      const specificColors = product.colors.filter(c => c.opcionComboNombre === opt);
                      const availableColors = specificColors.length > 0 
                        ? specificColors 
                        : product.colors.filter(c => !c.opcionComboNombre);

                      return (
                      <div key={opt} className={`${styles.selectorCard} ${styles.colorSelectorCard}`} style={{ marginBottom: '1rem' }}>
                        <div className={styles.selectorHeader}>
                          <p className={styles.label}>{opt}</p>
                          <span className={styles.selectorValue}>{comboSelections[opt] || 'Seleccionar color'}</span>
                        </div>
                        <div className={styles.colorSwatches}>
                          {availableColors.map((color) => (
                            <button
                              key={color.name}
                              type="button"
                              className={`${styles.swatch} ${comboSelections[opt] === color.name ? styles.activeSwatch : ''}`}
                              onClick={() => setComboSelections(prev => ({ ...prev, [opt]: color.name }))}
                              title={color.name}
                            >
                              <span className={styles.swatchInner} style={{ backgroundColor: color.hex }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className={`${styles.selectorCard} ${styles.colorSelectorCard}`}>
                    <div className={styles.selectorHeader}>
                      <p className={styles.label}>Color</p>
                      <span className={styles.selectorValue}>{selectedColor?.name}</span>
                    </div>

                    <div className={styles.colorSwatches}>
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          className={`${styles.swatch} ${selectedColor?.name === color.name ? styles.activeSwatch : ''}`}
                          onClick={() => handleColorChange(color)}
                          aria-label={color.name}
                          title={color.name}
                        >
                          <span className={styles.swatchInner} style={{ backgroundColor: color.hex }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`${styles.selectorCard} ${styles.quantitySelectorCard}`}>
                  <div className={styles.selectorHeader}>
                    <p className={styles.label}>Cantidad</p>
                    <span className={styles.selectorValue}>
                      {quantity} unidad{quantity > 1 ? 'es' : ''}
                    </span>
                  </div>

                  <div className={styles.quantity}>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={currentStock > 0 ? currentStock : undefined}
                      value={quantity === 0 ? '' : quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      onBlur={() => {
                        if (quantity === 0) {
                          setQuantity(1);
                        }
                      }}
                      className={styles.quantityInput}
                      aria-label="Cantidad de productos"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(currentStock > 0 ? Math.min(currentStock, quantity + 1) : quantity + 1)}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {currentStock > 0 && (
                    <p className={styles.quantityHint}>Disponible: {currentStock} unidad{currentStock === 1 ? '' : 'es'}</p>
                  )}
                </div>

                <div className={styles.actions}>
                  <button className={styles.addBtn} onClick={handleAddToCart} disabled={product.isSoldOut}>
                    {product.isSoldOut ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
                  </button>
                </div>

                <p className={styles.shippingNote}>
                  Envio a toda Colombia. Empaque delicado y listo para regalar.
                </p>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailCard}>
                  <Sparkles size={18} />
                  <div>
                    <span className={styles.detailTitle}>Material</span>
                    <span className={styles.detailValue}>Materiales Premiun</span>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <ShieldCheck size={18} />
                  <div>
                    <span className={styles.detailTitle}>Diseño</span>
                    <span className={styles.detailValue}>Somos diseñadores </span>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <Truck size={18} />
                  <div>
                    <span className={styles.detailTitle}>Envio</span>
                    <span className={styles.detailValue}>14.000 Mil </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {curatedProducts.length > 0 && (
          <section className={styles.related}>
            <div className={styles.relatedIntro}>
              <p className={styles.relatedKicker}>Productos recomendados</p>
              <div className={styles.relatedDivider} aria-hidden="true">
                <span />
                <Sparkles size={18} />
                <span />
              </div>
              <p className={styles.relatedSubtitle}>Completa tu estilo con estas sugerencias</p>
            </div>

            <div 
              className={styles.relatedWindow}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                ref={trackRef}
                className={`${styles.trackContainer} ${!isDragging ? styles.trackAnimated : ''}`}
                style={{
                  transform: isDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
                  transition: isDragging ? 'none' : 'transform 0.5s ease-out'
                }}
              >
                {(() => {
                  // Para que no quede espacio vacío, repetimos la lista hasta tener al menos 10 elementos
                  let displayItems = [...curatedProducts];
                  while (displayItems.length > 0 && displayItems.length < 10) {
                    displayItems = [...displayItems, ...curatedProducts];
                  }
                  
                  return displayItems.map((p, idx) => (
                    <div
                      key={`${p.id}-${idx}`}
                      className={styles.relatedItem}
                    >
                      <ProductCard product={p} index={idx} variant="collection" />
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className={styles.relatedFooter}>
              <Link to="/coleccion" className={styles.relatedLink}>
                Ver toda la colección <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Modal para ver imagen ampliada */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className={styles.imageModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <button
              className={styles.closeModalBtn}
              onClick={() => setIsModalOpen(false)}
              aria-label="Cerrar imagen"
            >
              <X size={32} color="#fff" />
            </button>
            <motion.img
              src={primaryImage}
              alt={product.name}
              className={styles.modalImage}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {isLeaving && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <p style={{ color: '#c2185b', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.1em' }}>CARGANDO...</p>
        </div>
      )}
    </motion.div>
  );
};
