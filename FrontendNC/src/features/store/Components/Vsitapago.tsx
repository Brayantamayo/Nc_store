import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, Minus, Plus, ShieldCheck, Trash2, Truck, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from '../../store/pages/cartStore';
import { useOrderStore, Order, OrderItem } from '../../store/pages/orderStore';
import { productoService } from '../../productos/services/productoService';
import { varianteService } from '../../variante/services/varianteService';
import styles from '../css/Cart.module.css';

const SHIPPING_FEE = 14500;
const WHATSAPP_NUMBER = '573226865883';

const IDENTIFICATION_TYPES = ['Cedula de ciudadania', 'Cedula de extranjeria', 'Pasaporte', 'NIT'];

const CITY_OPTIONS_BY_DEPARTMENT: Record<string, string[]> = {
  Antioquia: ['Medellin', 'Envigado', 'Sabaneta', 'Bello', 'Itagui', 'Rionegro'],
  Cundinamarca: ['Bogota', 'Chia', 'Soacha', 'Zipaquira'],
  Valle: ['Cali', 'Palmira', 'Jamundi'],
  Atlantico: ['Barranquilla', 'Soledad', 'Puerto Colombia'],
  Santander: ['Bucaramanga', 'Floridablanca', 'Giron'],
};

const PAYMENT_OPTIONS = [
  {
    id: 'transfer',
    title: 'Transferencia o link de pago',
    description: 'Registramos tu pedido y te enviamos el paso a paso para finalizar el pago.',
    chips: ['PSE', 'Nequi', 'Daviplata'],
  },
  {
    id: 'whatsapp',
    title: 'Confirmacion por WhatsApp',
    description: 'Ideal si quieres validar stock, tiempos de entrega o resolver dudas antes de pagar.',
    chips: ['Asesoria', 'Entrega', 'Soporte'],
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

const OrderSuccessView = ({
  generatedOrderId,
  whatsappUrl,
}: {
  generatedOrderId: string;
  whatsappUrl: string;
}) => (
  <div className={styles.emptyPage}>
    <div className="container">
      <div className={styles.successView}>
        <CheckCircle size={64} className={styles.successIcon} />
        <p className={styles.sectionKicker}>Pedido confirmado</p>
        <h1 className={styles.successTitle}>Gracias por tu compra</h1>
        <p className={styles.successText}>
          Tu pedido ya quedo registrado. Enseguida te llevamos a WhatsApp para confirmar el pago y los detalles del envio.
        </p>
        <div className={styles.orderIdBadge}>ID DEL PEDIDO: {generatedOrderId}</div>
        <p className={styles.successMeta}>
          Estamos redirigiendote a WhatsApp {WHATSAPP_NUMBER} para continuar la atencion de tu compra.
        </p>
        <a href={whatsappUrl} className={styles.primaryAction}>
          Abrir WhatsApp ahora
        </a>
        <Link to="/coleccion" className={styles.secondaryAction}>
          Seguir explorando
        </Link>
      </div>
    </div>
  </div>
);

const EmptyCartState = ({
  kicker,
  title,
  text,
  actionTo,
  actionLabel,
}: {
  kicker: string;
  title: string;
  text: string;
  actionTo: string;
  actionLabel: string;
}) => (
  <div className={styles.emptyPage}>
    <div className="container">
      <div className={styles.emptyStateCard}>
        <p className={styles.sectionKicker}>{kicker}</p>
        <h1 className={styles.emptyTitle}>{title}</h1>
        <p className={styles.emptyText}>{text}</p>
        <Link to={actionTo} className={styles.primaryAction}>
          {actionLabel}
        </Link>
      </div>
    </div>
  </div>
);

export const Cart = () => {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const [cartNotice, setCartNotice] = useState('');

  const subtotal = total();
  const grandTotal = subtotal + SHIPPING_FEE;

  const handleRefreshCart = () => {
    setCartNotice('Tu carrito ya esta actualizado con las cantidades actuales.');
  };

  if (items.length === 0) {
    return (
      <EmptyCartState
        kicker="Tu carrito"
        title="Tu bolsa esta vacia"
        text="Cuando agregues productos, aqui apareceran organizados con su resumen antes de pasar al checkout."
        actionTo="/coleccion"
        actionLabel="Explorar coleccion"
      />
    );
  }

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className={`container ${styles.pageShell}`}>
        <header className={styles.header}>
          <Link to="/coleccion" className={styles.backLink}>
            <ArrowLeft size={16} /> Continuar comprando
          </Link>
          <p className={styles.sectionKicker}>Tu seleccion</p>
          <h1 className={styles.title}>Carrito</h1>
          <div className={styles.sparkleDivider} aria-hidden="true">
            <span />
            <i />
            <span />
          </div>
          <p className={styles.headerCopy}>
            Aqui revisas tu pedido y, cuando estes lista, pasas a una pagina aparte para completar la compra con calma.
          </p>
        </header>

        <section className={styles.cartSection}>
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <span className={styles.productColumn}>Producto</span>
              <span>Precio</span>
              <span>Cantidad</span>
              <span>Subtotal</span>
            </div>

            <div className={styles.tableBody}>
              {items.map((item) => (
                <article key={item.id} className={styles.itemRow}>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className={styles.removeBtn}
                    aria-label={`Eliminar ${item.product.name}`}
                  >
                    <Trash2 size={16} />
                  </button>

                  <Link to={`/producto/${item.product.slug}`} className={styles.productCell}>
                    <div className={styles.itemImageWrapper}>
                      <img src={item.product.images[0]} alt={item.product.name} className={styles.itemImage} />
                    </div>

                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemName}>{item.product.name}</h3>
                      <p className={styles.itemMeta}>Color: {item.selectedColor.name}</p>
                    </div>
                  </Link>

                  <div className={styles.priceCell}>{formatCurrency(item.product.price)}</div>

                  <div className={styles.quantityCell}>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Restar">
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      className={styles.quantityInput}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 1) return;
                        if (val > item.stock) {
                          toast.error(`Solo hay ${item.stock} unidad${item.stock === 1 ? '' : 'es'} disponibles de ${item.product.name}.`);
                          updateQuantity(item.id, item.stock);
                          return;
                        }
                        updateQuantity(item.id, val);
                      }}
                      aria-label="Cantidad"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity >= item.stock) {
                          toast.error(`Solo hay ${item.stock} unidad${item.stock === 1 ? '' : 'es'} disponibles de ${item.product.name}.`);
                          return;
                        }
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                      aria-label="Sumar"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className={styles.subtotalCell}>{formatCurrency(item.product.price * item.quantity)}</div>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.toolbar}>
            <button type="button" onClick={handleRefreshCart} className={styles.secondaryAction}>
              Actualizar carrito
            </button>
          </div>

          {cartNotice && <p className={styles.inlineNotice}>{cartNotice}</p>}

          <div className={styles.summaryBand}>
            <div className={styles.summaryIntro}>
              <div className={styles.infoPill}>
                <Truck size={16} />
                <span>Tarifa fija de envio: {formatCurrency(SHIPPING_FEE)}</span>
              </div>
              <div className={styles.infoPill}>
                <ShieldCheck size={16} />
                <span>Tu pedido queda guardado incluso si prefieres confirmar el pago despues.</span>
              </div>
            </div>

            <aside className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Totales del carrito</h2>

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Envio</span>
                  <strong>{formatCurrency(SHIPPING_FEE)}</strong>
                </div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <strong>{formatCurrency(grandTotal)}</strong>
                </div>
              </div>

              <Link to="/finalizar-compra" className={styles.primaryAction}>
                Finalizar compra
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export const CheckoutPage = () => {
  const { items, total, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [identificationType, setIdentificationType] = useState(IDENTIFICATION_TYPES[0]);
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [department, setDepartment] = useState('Antioquia');
  const [customerCity, setCustomerCity] = useState(CITY_OPTIONS_BY_DEPARTMENT.Antioquia[0]);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_OPTIONS[0].id);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = total();
  const grandTotal = subtotal + SHIPPING_FEE;
  const departmentOptions = Object.keys(CITY_OPTIONS_BY_DEPARTMENT);
  const cityOptions = CITY_OPTIONS_BY_DEPARTMENT[department] ?? [];

  useEffect(() => {
    if (!cityOptions.includes(customerCity)) {
      setCustomerCity(cityOptions[0] ?? '');
    }
  }, [cityOptions, customerCity]);

  useEffect(() => {
    if (!isSuccess || !whatsappUrl) return undefined;

    const timer = window.setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [isSuccess, whatsappUrl]);

  const buildWhatsAppUrl = (order: Order) => {
    const messageLines = [
      'Hola, ya hice mi pedido en NC Store y quiero continuar la confirmacion.',
      `Pedido: ${order.id}`,
      `Nombre: ${order.customerName}`,
      `Telefono: ${order.customerPhone}`,
      `Correo: ${order.customerEmail}`,
      `Direccion: ${order.customerAddress}`,
      `Total: ${formatCurrency(order.total)}`,
      `Notas: ${orderNotes.trim() || 'Sin notas adicionales'}`,
      'Por favor, ayudenme con el siguiente paso.',
    ];

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageLines.join('\n'))}`;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: '' };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!identificationType.trim()) newErrors.identificationType = 'Selecciona un tipo de identificacion.';
    if (!identificationNumber.trim()) newErrors.identificationNumber = 'Ingresa tu numero de identificacion.';
    if (!firstName.trim()) newErrors.firstName = 'El nombre es obligatorio.';
    if (!lastName.trim()) newErrors.lastName = 'El apellido es obligatorio.';

    if (!customerEmail.trim()) {
      newErrors.customerEmail = 'El correo electronico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      newErrors.customerEmail = 'Ingresa un correo valido.';
    }

    if (!customerPhone.trim()) {
      newErrors.customerPhone = 'El telefono es obligatorio.';
    } else if (customerPhone.trim().length < 7) {
      newErrors.customerPhone = 'Ingresa un numero telefonico valido.';
    }

    if (!addressLine1.trim()) newErrors.addressLine1 = 'La direccion principal es obligatoria.';
    if (!department.trim()) newErrors.department = 'Selecciona un departamento.';
    if (!customerCity.trim()) newErrors.customerCity = 'Selecciona una ciudad.';
    if (!acceptTerms) newErrors.acceptTerms = 'Debes aceptar los terminos para continuar.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // ── Validar stock en tiempo real antes de confirmar ──────────────────────
    try {
      const stockErrors: string[] = [];

      for (const item of items) {
        const prodDetail = await productoService.obtenerPorId(Number(item.product.id));
        const matchedVariant = prodDetail.variantes?.find(
          (v) => v.color.toLowerCase().trim() === item.selectedColor.name.toLowerCase().trim()
        );

        if (!matchedVariant) {
          stockErrors.push(`La cantidad pedida de "${item.product.name} (${item.selectedColor.name})" no puede ser mayor a 0.`);
          continue;
        }

        if (matchedVariant.stock < item.quantity) {
          if (matchedVariant.stock === 0) {
            stockErrors.push(`La cantidad pedida de "${item.product.name} (${item.selectedColor.name})" no puede ser mayor a 0.`);
          } else {
            stockErrors.push(
              `La cantidad pedida de "${item.product.name} (${item.selectedColor.name})" no puede ser mayor a ${matchedVariant.stock}.`
            );
          }
        }
      }

      if (stockErrors.length > 0) {
        // Mostrar cada error como toast independiente para no sacar al usuario de la página
        stockErrors.forEach((msg) => toast.error(msg, { duration: 6000 }));
        return;
      }
    } catch {
      toast.error('No pudimos verificar el stock. Intenta de nuevo.');
      return;
    }

    // ── Descontar stock en la BD ─────────────────────────────────────────────
    try {
      for (const item of items) {
        const prodDetail = await productoService.obtenerPorId(Number(item.product.id));
        const matchedVariant = prodDetail.variantes?.find(
          (v) => v.color.toLowerCase().trim() === item.selectedColor.name.toLowerCase().trim()
        );
        if (matchedVariant) {
          await varianteService.ajustarStock(matchedVariant.id, -item.quantity);
        }
      }
    } catch (err) {
      console.error('Error al actualizar el stock:', err);
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-2026-${randomNum}`;

    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      colorName: item.selectedColor.name,
      colorHex: item.selectedColor.hex,
      image: item.product.images[0],
    }));

    const newOrder: Order = {
      id: orderId,
      customerName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: [
        addressLine1.trim(),
        addressLine2.trim(),
        customerCity,
        department,
        postalCode.trim(),
        'Colombia',
      ]
        .filter(Boolean)
        .join(', '),
      customerCity,
      items: orderItems,
      total: grandTotal,
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);
    setGeneratedOrderId(orderId);
    setWhatsappUrl(buildWhatsAppUrl(newOrder));
    setIsSuccess(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isSuccess) {
    return <OrderSuccessView generatedOrderId={generatedOrderId} whatsappUrl={whatsappUrl} />;
  }

  if (items.length === 0) {
    return (
      <EmptyCartState
        kicker="Checkout"
        title="No hay productos para finalizar"
        text="Vuelve al carrito o agrega productos antes de continuar con la compra."
        actionTo="/carrito"
        actionLabel="Volver al carrito"
      />
    );
  }

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className={`container ${styles.pageShell}`}>
        <section className={styles.checkoutSection}>
          <div className={styles.checkoutHeader}>
            <Link to="/carrito" className={styles.backLink}>
              <ArrowLeft size={16} /> Volver al carrito
            </Link>
            <p className={styles.sectionKicker}>Checkout</p>
            <h1 className={styles.checkoutTitle}>Finalizar compra</h1>
            <div className={styles.sparkleDivider} aria-hidden="true">
              <span />
              <i />
              <span />
            </div>
          </div>

          <div className={styles.checkoutNotices}>
            <div className={styles.noticeCard}>
              <span>Compra guiada</span>
              <p>Revisamos tus datos y luego te acompanamos para concretar el pago con calma.</p>
            </div>
            <div className={styles.noticeCard}>
              <span>Cupones y promos</span>
              <p>La estructura ya queda lista para conectar descuentos reales mas adelante.</p>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className={styles.checkoutGrid}>
            <div className={styles.billingColumn}>
              <div className={styles.panelCard}>
                <div className={styles.panelHeader}>
                  <p className={styles.panelEyebrow}>Detalles de facturacion</p>
                  <h3 className={styles.panelTitle}>Tus datos</h3>
                </div>

                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                    <label className={styles.formLabel}>
                      Tipo de identificacion <span>*</span>
                    </label>
                    <select
                      value={identificationType}
                      onChange={(e) => {
                        setIdentificationType(e.target.value);
                        clearError('identificationType');
                      }}
                      className={`${styles.textInput} ${errors.identificationType ? styles.inputError : ''}`}
                    >
                      {IDENTIFICATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.identificationType && <span className={styles.errorText}>{errors.identificationType}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                    <label className={styles.formLabel}>
                      No. de identificacion <span>*</span>
                    </label>
                    <input
                      type="text"
                      value={identificationNumber}
                      onChange={(e) => {
                        setIdentificationNumber(e.target.value);
                        clearError('identificationNumber');
                      }}
                      placeholder="Ej: 1039456789"
                      className={`${styles.textInput} ${errors.identificationNumber ? styles.inputError : ''}`}
                    />
                    {errors.identificationNumber && <span className={styles.errorText}>{errors.identificationNumber}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Nombre <span>*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        clearError('firstName');
                      }}
                      placeholder="Tu nombre"
                      className={`${styles.textInput} ${errors.firstName ? styles.inputError : ''}`}
                    />
                    {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Apellido <span>*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        clearError('lastName');
                      }}
                      placeholder="Tu apellido"
                      className={`${styles.textInput} ${errors.lastName ? styles.inputError : ''}`}
                    />
                    {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                    <label className={styles.formLabel}>
                      Pais / Region <span>*</span>
                    </label>
                    <div className={styles.staticField}>Colombia</div>
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                    <label className={styles.formLabel}>
                      Direccion <span>*</span>
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => {
                        setAddressLine1(e.target.value);
                        clearError('addressLine1');
                      }}
                      placeholder="Numero de casa y nombre de la calle"
                      className={`${styles.textInput} ${errors.addressLine1 ? styles.inputError : ''}`}
                    />
                    {errors.addressLine1 && <span className={styles.errorText}>{errors.addressLine1}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                    <label className={styles.formLabel}>Apartamento, suite, unidad, etc. (opcional)</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Informacion adicional de la direccion"
                      className={styles.textInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Departamento <span>*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        clearError('department');
                      }}
                      className={`${styles.textInput} ${errors.department ? styles.inputError : ''}`}
                    >
                      {departmentOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.department && <span className={styles.errorText}>{errors.department}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Ciudad <span>*</span>
                    </label>
                    <select
                      value={customerCity}
                      onChange={(e) => {
                        setCustomerCity(e.target.value);
                        clearError('customerCity');
                      }}
                      className={`${styles.textInput} ${errors.customerCity ? styles.inputError : ''}`}
                    >
                      {cityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.customerCity && <span className={styles.errorText}>{errors.customerCity}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                    <label className={styles.formLabel}>Codigo postal (opcional)</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Si aplica a tu zona"
                      className={styles.textInput}
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                    <label className={styles.formLabel}>
                      Telefono <span>*</span>
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        clearError('customerPhone');
                      }}
                      placeholder="Ej: +57 300 123 4567"
                      className={`${styles.textInput} ${errors.customerPhone ? styles.inputError : ''}`}
                    />
                    {errors.customerPhone && <span className={styles.errorText}>{errors.customerPhone}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                    <label className={styles.formLabel}>
                      Correo electronico <span>*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        clearError('customerEmail');
                      }}
                      placeholder="tu-correo@ejemplo.com"
                      className={`${styles.textInput} ${errors.customerEmail ? styles.inputError : ''}`}
                    />
                    {errors.customerEmail && <span className={styles.errorText}>{errors.customerEmail}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullSpan}`}>
                    <label className={styles.formLabel}>Notas del pedido (opcional)</label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Notas sobre tu pedido, por ejemplo referencias para la entrega."
                      className={`${styles.textInput} ${styles.textArea}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <aside className={styles.orderColumn}>
              <div className={styles.panelCard}>
                <div className={styles.panelHeader}>
                  <p className={styles.panelEyebrow}>Tu pedido</p>
                  <h3 className={styles.panelTitle}>Resumen</h3>
                </div>

                <div className={styles.orderItems}>
                  {items.map((item) => (
                    <div key={item.id} className={styles.orderItemRow}>
                      <div>
                        <strong>{item.product.name}</strong>
                        <span>
                          {item.selectedColor.name} x {item.quantity}
                        </span>
                      </div>
                      <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>

                <div className={styles.summaryRows}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Envio</span>
                    <strong>{formatCurrency(SHIPPING_FEE)}</strong>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total</span>
                    <strong>{formatCurrency(grandTotal)}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.panelCard}>
                <div className={styles.panelHeader}>
                  <p className={styles.panelEyebrow}>Metodo de pago</p>
                  <h3 className={styles.panelTitle}>Como quieres continuar</h3>
                </div>

                <div className={styles.paymentOptions}>
                  {PAYMENT_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={`${styles.paymentOption} ${selectedPayment === option.id ? styles.paymentOptionActive : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.id}
                        checked={selectedPayment === option.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                      />

                      <div className={styles.paymentContent}>
                        <div className={styles.paymentHeading}>
                          <WalletCards size={18} />
                          <span>{option.title}</span>
                        </div>
                        <p>{option.description}</p>

                        <div className={styles.paymentChips}>
                          {option.chips.map((chip) => (
                            <span key={chip}>{chip}</span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.panelCard}>
                <p className={styles.privacyText}>
                  Tus datos personales se utilizaran para procesar el pedido, coordinar la entrega y acompanarte en la confirmacion del pago.
                </p>
                <p className={styles.celebrationText}>
                  Gracias por confiar en nuestra tienda. Queremos que esta parte tambien se sienta linda, clara y facil de usar.
                </p>

                <label className={styles.termsRow}>
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      clearError('acceptTerms');
                    }}
                  />
                  <span>He leido y estoy de acuerdo con los terminos y condiciones de la web.</span>
                </label>
                {errors.acceptTerms && <span className={styles.errorText}>{errors.acceptTerms}</span>}

                <button type="submit" className={styles.primaryAction}>
                  Realizar el pedido
                </button>
              </div>
            </aside>
          </form>
        </section>
      </div>
    </motion.div>
  );
};
