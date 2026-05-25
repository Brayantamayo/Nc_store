import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/pages/cartStore';
import { useOrderStore, Order, OrderItem } from '../../store/pages/orderStore';
import styles from '../css/Cart.module.css';

export const Cart = () => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  // ── ESTADOS DE COMPRA / CHECKOUT ──
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  // ── ESTADOS DE FORMULARIO ──
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('Medellín');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── VALIDACIÓN DE FORMULARIO ──
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'El nombre completo es obligatorio.';
    } else if (customerName.trim().length < 3) {
      newErrors.customerName = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!customerEmail.trim()) {
      newErrors.customerEmail = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      newErrors.customerEmail = 'Ingresa un formato de correo válido (ej: cliente@gmail.com).';
    }

    if (!customerPhone.trim()) {
      newErrors.customerPhone = 'El teléfono de contacto es obligatorio.';
    } else if (customerPhone.trim().length < 7) {
      newErrors.customerPhone = 'Ingresa un número telefónico válido.';
    }

    if (!customerAddress.trim()) {
      newErrors.customerAddress = 'La dirección de envío es obligatoria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── SUBMIT PEDIDO ──
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Generar ID único para el pedido (ORD-2026-xxxx)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-2026-${randomNum}`;

    // Transformar CartItem a OrderItem
    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      colorName: item.selectedColor.name,
      colorHex: item.selectedColor.hex,
      image: item.product.images[0]
    }));

    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerCity: customerCity,
      items: orderItems,
      total: total(),
      status: 'Pendiente',
      createdAt: new Date().toISOString()
    };

    // Agregar a la orden, vaciar el carrito, y mostrar éxito
    addOrder(newOrder);
    setGeneratedOrderId(orderId);
    setIsCheckoutOpen(false);
    setIsSuccess(true);
    clearCart();
  };

  // Si la compra fue exitosa, renderizamos la pantalla de éxito
  if (isSuccess) {
    return (
      <div className={styles.emptyPage}>
        <div className="container">
          <div className={styles.successView}>
            <CheckCircle size={64} className={styles.successIcon} />
            <h1 className={styles.successTitle}>¡Gracias por tu compra!</h1>
            <p className={styles.successText}>
              Hemos recibido tu orden correctamente. Nuestro taller en Medellín comenzará a preparar tus piezas coquette con todo el amor.
            </p>
            <div className={styles.orderIdBadge}>
              ID DEL PEDIDO: {generatedOrderId}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#7d6b73', marginBottom: '1.5rem' }}>
              Guarda este identificador para cualquier consulta sobre tu envío.
            </p>
            <Link to="/coleccion" className={styles.successLink}>Seguir Explorando</Link>
          </div>
        </div>
      </div>
    );
  }

  // Si el carrito está vacío, pantalla estándar
  if (items.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <div className="container">
          <h1 className={styles.emptyTitle}>Tu bolsa está vacía</h1>
          <p className={styles.emptyText}>Parece que aún no has añadido nada a tu selección de lujo.</p>
          <Link to="/coleccion" className={styles.emptyLink}>Explorar Colección</Link>
        </div>
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
      <div className="container">
        <header className={styles.header}>
          <Link to="/coleccion" className={styles.backLink}>
            <ArrowLeft size={16} /> Continuar comprando
          </Link>
          <h1 className={styles.title}>Bolsa de Compras</h1>
        </header>

        <div className={styles.layout}>
          {/* List */}
          <div className={styles.list}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <Link to={`/producto/${item.product.slug}`} className={styles.itemImageWrapper}>
                  <img src={item.product.images[0]} alt={item.product.name} className={styles.itemImage} />
                </Link>
                <div className={styles.itemInfo}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemName}>{item.product.name}</h3>
                    <p className={styles.itemPrice}>
                      {new Intl.NumberFormat('es-CO', { 
                        style: 'currency', 
                        currency: 'COP',
                        maximumFractionDigits: 0 
                      }).format(item.product.price)}
                    </p>
                  </div>
                  <p className={styles.itemMeta}>Color: {item.selectedColor.name}</p>
                  
                  <div className={styles.itemControls}>
                    <div className={styles.quantity}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className={styles.removeBtn}>
                      <Trash2 size={18} />
                    </button>
                    <p className={styles.itemSubtotal}>
                      {new Intl.NumberFormat('es-CO', { 
                        style: 'currency', 
                        currency: 'COP',
                        maximumFractionDigits: 0 
                      }).format(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Resumen del pedido</h2>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>
                    {new Intl.NumberFormat('es-CO', { 
                      style: 'currency', 
                      currency: 'COP',
                      maximumFractionDigits: 0 
                    }).format(total())}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Envío</span>
                  <span className={styles.free}>Gratis</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat('es-CO', { 
                      style: 'currency', 
                      currency: 'COP',
                      maximumFractionDigits: 0 
                    }).format(total())}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsCheckoutOpen(true)} className={styles.checkoutBtn}>
                Proceder al Pago
              </button>
              <div className={styles.paymentIcons}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL DE CHECKOUT: DATOS DE ENVÍO ── */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className={styles.modalBackdrop}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.checkoutModal}
            >
              <div className={styles.modalHeader}>
                <h2>Detalles de Envío</h2>
                <button onClick={() => setIsCheckoutOpen(false)} className={styles.closeModalBtn}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className={styles.checkoutForm}>
                {/* Nombre Completo */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Nombre Completo <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
                    }}
                    placeholder="ej: María Camila Restrepo"
                    className={`${styles.textInput} ${errors.customerName ? styles.inputError : ''}`}
                  />
                  {errors.customerName && (
                    <span className={styles.errorText}>{errors.customerName}</span>
                  )}
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Correo Electrónico <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (errors.customerEmail) setErrors((prev) => ({ ...prev, customerEmail: '' }));
                    }}
                    placeholder="ej: maria@gmail.com"
                    className={`${styles.textInput} ${errors.customerEmail ? styles.inputError : ''}`}
                  />
                  {errors.customerEmail && (
                    <span className={styles.errorText}>{errors.customerEmail}</span>
                  )}
                </div>

                {/* Teléfono */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Teléfono de Contacto <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (errors.customerPhone) setErrors((prev) => ({ ...prev, customerPhone: '' }));
                    }}
                    placeholder="ej: +57 311 234 5678"
                    className={`${styles.textInput} ${errors.customerPhone ? styles.inputError : ''}`}
                  />
                  {errors.customerPhone && (
                    <span className={styles.errorText}>{errors.customerPhone}</span>
                  )}
                </div>

                {/* Ciudad */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Ciudad de Envío <span className={styles.required}>*</span>
                  </label>
                  <select
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className={styles.textInput}
                    style={{ padding: '0.75rem 1rem' }}
                  >
                    <option value="Medellín">Medellín</option>
                    <option value="Bogotá">Bogotá</option>
                    <option value="Cali">Cali</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Pereira">Pereira</option>
                    <option value="Envigado">Envigado</option>
                    <option value="Sabaneta">Sabaneta</option>
                  </select>
                </div>

                {/* Dirección Completa */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Dirección de Envío Completa <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => {
                      setCustomerAddress(e.target.value);
                      if (errors.customerAddress) setErrors((prev) => ({ ...prev, customerAddress: '' }));
                    }}
                    placeholder="Calle/Carrera, Número de apartamento, Barrio"
                    className={`${styles.textInput} ${errors.customerAddress ? styles.inputError : ''}`}
                  />
                  {errors.customerAddress && (
                    <span className={styles.errorText}>{errors.customerAddress}</span>
                  )}
                </div>

                {/* Acciones */}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className={styles.cancelBtn}
                  >
                    Volver
                  </button>
                  <button type="submit" className={styles.confirmBtn}>
                    CONFIRMAR COMPRA
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
