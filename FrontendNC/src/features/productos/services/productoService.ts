import { Product, ProductCategory } from '../../../types';
import { ServiceResponse } from '../../../../shared/types/serviceResponse';
import { useProductStore } from '../../store/pages/productStore';

const sanitizeInput = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const productoService = {
  guardar: async (
    productData: Partial<Product>,
    isEdit: boolean
  ): Promise<ServiceResponse<Product>> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const errors: Record<string, string> = {};
    const name = productData.name?.trim() || '';

    if (!name) errors.name = 'El nombre del producto es obligatorio.';
    else if (name.length < 3) errors.name = 'El nombre debe tener al menos 3 caracteres.';

    const price = Number(productData.price);
    if (isNaN(price)) errors.price = 'El precio debe ser un valor numérico.';
    else if (price <= 0) errors.price = 'El precio debe ser un número positivo mayor que cero.';

    if (!productData.category) errors.category = 'Debes seleccionar una categoría válida.';

    const material = productData.material?.trim() || '';
    if (!material) errors.material = 'El material es obligatorio (ej. Cuero Vegano).';

    const description = productData.description?.trim() || '';
    if (!description) errors.description = 'La descripción es obligatoria.';

    if (!productData.images?.length || !productData.images[0]) {
      errors.images = 'Debes ingresar al menos la imagen principal.';
    } else {
      productData.images.forEach((img, idx) => {
        if (img && !isValidUrl(img)) {
          errors.images = `La URL de la imagen ${idx + 1} no tiene un formato válido.`;
        }
      });
    }

    if (!productData.colors?.length) {
      errors.colors = 'Debes añadir al menos una opción de color.';
    } else {
      productData.colors.forEach((color, idx) => {
        if (!color.name.trim()) errors.colors = `El nombre del color ${idx + 1} es obligatorio.`;
        if (!/^#[0-9A-F]{6}$/i.test(color.hex)) {
          errors.colors = `El código hex del color ${idx + 1} debe ser válido (ej. #FFFFFF).`;
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors, message: 'Por favor, corrige los errores en el formulario.' };
    }

    const sanitizedProduct: Product = {
      id: productData.id || String(Date.now()),
      slug: productData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: sanitizeInput(name),
      price,
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
      category: productData.category as ProductCategory,
      colors: (productData.colors || []).map((c) => ({
        name: sanitizeInput(c.name),
        hex: c.hex.trim(),
      })),
      material: sanitizeInput(material),
      description: sanitizeInput(description),
      images: (productData.images || []).filter(Boolean),
      isNew: !!productData.isNew,
      isSoldOut: !!productData.isSoldOut,
      isFeatured: !!productData.isFeatured,
      tags: (productData.tags || []).map((t) => sanitizeInput(t.trim())).filter(Boolean),
    };

    try {
      const store = useProductStore.getState();
      if (isEdit) store.updateProduct(sanitizedProduct.id, sanitizedProduct);
      else store.addProduct(sanitizedProduct);

      return {
        success: true,
        data: sanitizedProduct,
        message: isEdit ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.',
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Ocurrió un error inesperado al guardar el producto.';
      return { success: false, message };
    }
  },

  eliminar: async (id: string): Promise<ServiceResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      useProductStore.getState().deleteProduct(id);
      return { success: true, message: 'Producto eliminado correctamente.' };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al intentar eliminar el producto.';
      return { success: false, message };
    }
  },
};
