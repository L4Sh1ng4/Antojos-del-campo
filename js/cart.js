/**
 * Antojos del Campo - Carrito de compras y Checkout WhatsApp
 * Sistema completo de carrito con persistencia en localStorage
 */

(function () {
  'use strict';

  // ============================================================
  // CONFIGURACIÓN
  // ============================================================
  const WHATSAPP_NUMBER = '573136994356'; // Sin el + ni espacios
  const STORAGE_KEY = 'antojos_cart';
  const MAX_QUANTITY = 99;

  // Mapa de IDs de producto a sus archivos de imagen reales
  const PRODUCT_IMAGES = {
    'quesitos': 'quesito.png',
    'cuajadas': 'cuajada.png',
    'pandequeso': 'pandequeso.png',
    'almojabanas': 'almojabanas.png',
    'quesadillas-bocadillo': 'quesadillas-bocadillo.png',
    'quesadillas-arequipe': 'quesadillas-arequipe.png',
    'mantequilla': 'mantequilla.jpg',
    'arepas-chocolo': 'arepa-chocolo.jpg',
    'mix-verde': 'mix-verde.png',
    'mix-rojo': 'mix-rojo.png',
    'mix-amarillo': 'mix-amarillo.png',
    'mix-naranja': 'mix-naranja.png'
  };

  function getProductImageSrc(productId) {
    return `assets/images/${PRODUCT_IMAGES[productId] || productId + '.png'}`;
  }

  // ============================================================
  // ESTADO DEL CARRITO
  // ============================================================
  let cart = [];

  // ============================================================
  // ELEMENTOS DOM
  // ============================================================
  let cartFloatBtn = null;
  let cartBadge = null;
  let cartDrawer = null;
  let cartOverlay = null;
  let cartPanel = null;
  let cartCloseBtn = null;
  let cartItemsContainer = null;
  let cartEmpty = null;
  let cartSubtotalEl = null;
  let checkoutBtn = null;
  let checkoutModal = null;
  let checkoutForm = null;
  let checkoutFormEl = null;
  let checkoutCloseBtn = null;
  let checkoutBackBtn = null;
  let checkoutSubmitBtn = null;
  let checkoutModalEl = null;
  let toastContainer = null;

  // ============================================================
  // INICIALIZACIÓN
  // ============================================================
  function init() {
    loadCartFromStorage();
    cacheDOMElements();
    bindEvents();
    renderCart();
    updateCartBadge();
  }

  // ============================================================
  // PERSISTENCIA LOCALSTORAGE
  // ============================================================
  function loadCartFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        cart = JSON.parse(stored);
        // Validar estructura
        cart = cart.filter(item =>
          item &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.price === 'number' &&
          typeof item.quantity === 'number' &&
          item.quantity > 0
        );
      }
    } catch (e) {
      console.warn('Error al cargar carrito:', e);
      cart = [];
    }
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Error al guardar carrito:', e);
    }
  }

  // ============================================================
  // CACHE DE ELEMENTOS DOM
  // ============================================================
  function cacheDOMElements() {
    // Floating cart button
    cartFloatBtn = document.getElementById('cart-float');
    cartBadge = document.getElementById('cart-badge');

    // Cart drawer
    cartDrawer = document.getElementById('cart-drawer');
    cartOverlay = cartDrawer?.querySelector('.cart-drawer__overlay');
    cartPanel = cartDrawer?.querySelector('.cart-drawer__panel');
    cartCloseBtn = cartDrawer?.querySelector('.cart-drawer__close');
    cartItemsContainer = document.getElementById('cart-items');
    cartEmpty = document.getElementById('cart-empty');
    cartSubtotalEl = document.getElementById('cart-subtotal');
    checkoutBtn = document.getElementById('checkout-btn');

    // Checkout modal
    checkoutModalEl = document.getElementById('checkout-modal');
    checkoutFormEl = document.getElementById('checkout-form');
    checkoutCloseBtn = document.querySelector('.checkout-modal__close');
    checkoutBackBtn = document.getElementById('checkout-back');
    checkoutSubmitBtn = document.getElementById('checkout-submit');
    checkoutFormEl = document.getElementById('checkout-form');

    // Toast container
    toastContainer = document.getElementById('toast-container');
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  function bindEvents() {
    // Delegación de eventos para botones "Agregar al carrito"
    document.addEventListener('click', handleAddToCartClick);

    // Delegación para botones de cantidad en tarjetas
    document.addEventListener('click', handleQuantityBtnClick);
    document.addEventListener('change', handleQuantityInputChange);

    // Cart drawer
    if (cartFloatBtn) {
      cartFloatBtn.addEventListener('click', openCartDrawer);
    }
    if (cartCloseBtn) {
      cartCloseBtn.addEventListener('click', closeCartDrawer);
    }
    if (cartOverlay) {
      cartOverlay.addEventListener('click', closeCartDrawer);
    }

    // Cart item actions (delegación)
    document.addEventListener('click', handleCartItemAction);
    document.addEventListener('click', handleCartItemQuantityBtnClick);
    document.addEventListener('change', handleCartItemQuantityInputChange);

    // Checkout button
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', openCheckoutModal);
    }

    // Checkout modal
    if (checkoutCloseBtn) {
      checkoutCloseBtn.addEventListener('click', closeCheckoutModal);
    }
    if (checkoutBackBtn) {
      checkoutBackBtn.addEventListener('click', closeCheckoutModal);
    }

    // Close modal on overlay click
    const checkoutOverlay = document.querySelector('.checkout-modal__overlay');
    if (checkoutOverlay) {
      checkoutOverlay.addEventListener('click', closeCheckoutModal);
    }

    // Form submission
    if (checkoutFormEl) {
      checkoutFormEl.addEventListener('submit', handleCheckoutSubmit);
    }

// Filtrar input de teléfono: solo permitir números
    const phoneInput = document.getElementById('shipping-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function(e) {
        // Filtrar solo números
        this.value = this.value.replace(/\D/g, '');
      });
    }

    if (checkoutBackBtn) {
      checkoutBackBtn.addEventListener('click', () => {
        closeCheckoutModal();
        openCartDrawer();
      });
    }

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeCartDrawer();
        closeCheckoutModal();
      }
    });

    // Prevent scroll on body when drawers open
    document.addEventListener('click', (e) => {
      if (e.target.closest('.cart-float')) return;
    });
  }

  // ============================================================
  // HANDLERS - PRODUCT CARDS
  // ============================================================
  function handleAddToCartClick(e) {
    const addBtn = e.target.closest('[data-action="add-to-cart"]');
    if (!addBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const card = addBtn.closest('[data-product-id]');
    if (!card) return;

    const productId = card.dataset.productId;
    const productName = card.dataset.productName;
    const productPrice = parseInt(card.dataset.productPrice, 10);

    // Buscar el input de cantidad en la misma tarjeta
    const cardElement = addBtn.closest('[data-product-id]');
    const quantityInput = cardElement?.querySelector('.quantity-selector__input');
    const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 0;

    // Validar cantidad
    if (quantity <= 0) {
      showToast('Por favor ingrese una cantidad', 'error');
      // Animar el input para llamar la atención
      if (quantityInput) {
        quantityInput.classList.add('quantity-selector__input--error');
        setTimeout(() => quantityInput.classList.remove('quantity-selector__input--error'), 1000);
      }
      return;
    }

    addToCart({
      id: productId,
      name: productName,
      price: productPrice,
      quantity: quantity
    });

    // Reset quantity input to 0
    if (quantityInput) {
      quantityInput.value = 0;
    }

    // Animación de confirmación en el botón
    animateAddButton(addBtn);

    // Mostrar toast
    showToast(`Agregado al carrito`, 'success');
  }

  function handleQuantityBtnClick(e) {
    const btn = e.target.closest('.quantity-selector__btn');
    if (!btn) return;

    e.preventDefault();
    const input = btn.parentElement?.querySelector('.quantity-selector__input');
    if (!input) return;

    const current = parseInt(input.value, 10) || 0;
    const isIncrease = btn.classList.contains('quantity-selector__btn--increase');
    const newValue = isIncrease ? Math.min(current + 1, 99) : Math.max(current - 1, 0);
    input.value = newValue;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function handleQuantityInputChange(e) {
    const input = e.target.closest('.quantity-selector__input');
    if (!input) return;

    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    if (value > 99) value = 99;
    input.value = value;
  }

  // ============================================================
  // HANDLERS - CART DRAWER ITEMS
  // ============================================================
  function handleCartItemAction(e) {
    const removeBtn = e.target.closest('.cart-item__remove');
    if (!removeBtn) return;

    e.preventDefault();
    const itemEl = removeBtn.closest('.cart-item');
    const productId = itemEl?.dataset.productId;
    if (productId) {
      removeFromCart(productId);
    }
  }

  function handleCartItemQuantityBtnClick(e) {
    const btn = e.target.closest('.cart-item__quantity-btn');
    if (!btn) return;

    e.preventDefault();
    const itemEl = btn.closest('.cart-item');
    const productId = itemEl?.dataset.productId;
    if (!productId) return;

    const isIncrease = btn.classList.contains('cart-item__quantity-btn--increase');
    updateCartItemQuantity(productId, isIncrease ? 1 : -1);
  }

  function handleCartItemQuantityInputChange(e) {
    const input = e.target.closest('.cart-item__quantity-value');
    if (!input) return;

    const itemEl = input.closest('.cart-item');
    const productId = itemEl?.dataset.productId;
    if (!productId) return;

    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) value = 1;
    if (value > MAX_QUANTITY) value = MAX_QUANTITY;

    const item = cart.find(item => item.id === productId);
    if (item) {
      item.quantity = value;
      saveCartToStorage();
      renderCart();
      updateCartBadge();
    }
  }

  // ============================================================
  // CART OPERATIONS
  // ============================================================
  function addToCart(product) {
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex !== -1) {
      const newQuantity = cart[existingIndex].quantity + product.quantity;
      cart[existingIndex].quantity = Math.min(newQuantity, MAX_QUANTITY);
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity
      });
    }

    saveCartToStorage();
    renderCart();
    updateCartBadge();
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    renderCart();
    updateCartBadge();
  }

  function updateCartItemQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity > MAX_QUANTITY) {
      item.quantity = MAX_QUANTITY;
      saveCartToStorage();
      renderCart();
      updateCartBadge();
    } else {
      item.quantity = newQuantity;
      saveCartToStorage();
      renderCart();
      updateCartBadge();
    }
  }

  function clearCart() {
    cart = [];
    saveCartToStorage();
    renderCart();
    updateCartBadge();
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // ============================================================
  // RENDER
  // ============================================================
  function renderCart() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      if (cartEmpty) cartEmpty.hidden = false;
      if (cartItemsContainer) cartItemsContainer.innerHTML = '';
      if (checkoutBtn) checkoutBtn.disabled = true;
      updateSubtotalDisplay();
    } else {
      if (cartEmpty) cartEmpty.hidden = true;
      if (checkoutBtn) checkoutBtn.disabled = false;

      cartItemsContainer.innerHTML = cart.map(item => `
        <li class="cart-item" data-product-id="${item.id}">
          <img class="cart-item__image" src="${getProductImageSrc(item.id)}" alt="${item.name}" loading="lazy">
          <div class="cart-item__details">
            <span class="cart-item__name">${escapeHtml(item.name)}</span>
            <span class="cart-item__price">${formatPrice(item.price)} c/u</span>
            <div class="cart-item__quantity">
              <button type="button" class="cart-item__quantity-btn cart-item__quantity-btn--decrease" aria-label="Disminuir">−</button>
              <span class="cart-item__quantity-value">${escapeHtml(String(item.quantity))}</span>
              <button type="button" class="cart-item__quantity-btn cart-item__quantity-btn--increase" aria-label="Aumentar">+</button>
            </div>
          </div>
          <span class="cart-item__subtotal">${formatPrice(item.price * item.quantity)}</span>
          <button type="button" class="cart-item__remove" aria-label="Eliminar ${escapeHtml(item.name)}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </li>
      `).join('');

      // Actualizar subtotal
      updateSubtotalDisplay();
    }
  }

  function updateSubtotalDisplay() {
    if (cartSubtotalEl) {
      cartSubtotalEl.textContent = formatPrice(getSubtotal());
    }
  }

  function updateCartBadge() {
    const count = getCartCount();
    if (cartBadge) {
      cartBadge.textContent = count > 99 ? '99+' : count;
      cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
    if (checkoutBtn) {
      checkoutBtn.disabled = getCartCount() === 0;
    }
  }

  // ============================================================
  // CART DRAWER
  // ============================================================
  function openCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    document.body.classList.add('no-scroll');
    renderCart();
  }

  function closeCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  // ============================================================
  // CHECKOUT MODAL
  // ============================================================
  function openCheckoutModal() {
    if (getCartCount() === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }

    closeCartDrawer();

    if (!checkoutModalEl) return;
    checkoutModalEl.hidden = false;
    document.body.classList.add('no-scroll');

    // Focus first field
    setTimeout(() => {
      const firstInput = document.getElementById('shipping-name');
      if (firstInput) firstInput.focus();
    }, 300);
  }

  function closeCheckoutModal() {
    if (!checkoutModalEl) return;
    checkoutModalEl.hidden = true;
    document.body.classList.remove('no-scroll');

    // Reset form
    if (checkoutFormEl) {
      checkoutFormEl.reset();
      clearFormErrors();
    }
  }

  // ============================================================
  // CHECKOUT FORM VALIDATION & SUBMISSION
  // ============================================================
  function handleCheckoutSubmit(e) {
    e.preventDefault();

    if (!validateCheckoutForm()) {
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const formData = new FormData(checkoutFormEl);
    const orderData = {
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal: getSubtotal(),
      shipping: {
        name: formData.get('shippingName'),
        phone: formData.get('shippingPhone'),
        address: formData.get('shippingAddress'),
        neighborhood: formData.get('shippingNeighborhood')
      },
      paymentMethod: formData.get('paymentMethod'),
      notes: formData.get('notes') || ''
    };

    // Generar mensaje WhatsApp
    const whatsappMessage = buildWhatsAppMessage(orderData);
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Limpiar carrito tras pedido exitoso
    clearCart();
    closeCheckoutModal();
    closeCartDrawer();

    showToast('¡Pedido enviado por WhatsApp! 🎉', 'success');
  }

  function validateCheckoutForm() {
    let isValid = true;
    const requiredFields = [
      { id: 'shipping-name', errorId: 'error-shipping-name', message: 'Por favor ingresa tu nombre completo' },
      { id: 'shipping-phone', errorId: 'error-shipping-phone', message: 'Por favor ingresa tu número de teléfono' },
      { id: 'shipping-address', errorId: 'error-shipping-address', message: 'Por favor ingresa tu dirección completa' },
      { id: 'shipping-neighborhood', errorId: 'error-shipping-neighborhood', message: 'Por favor ingresa tu barrio' },
      { id: 'payment-method', errorId: 'error-payment-method', message: 'Por favor selecciona un método de pago' }
    ];

    requiredFields.forEach(field => {
      const input = document.getElementById(field.id);
      const errorEl = document.getElementById(field.errorId);
      const fieldContainer = input.closest('.checkout-form__field');
      if (!input.value.trim()) {
        if (errorEl) errorEl.textContent = field.message;
        if (fieldContainer) fieldContainer.classList.add('has-error');
        isValid = false;
      } else {
        if (errorEl) errorEl.textContent = '';
        if (fieldContainer) fieldContainer.classList.remove('has-error');
      }
    });

    // Validar teléfono (solo números, sin espacios ni caracteres especiales)
    const phoneInput = document.getElementById('shipping-phone');
    if (phoneInput && phoneInput.value.trim()) {
      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(phoneInput.value.trim())) {
        const errorEl = document.getElementById('error-shipping-phone');
        if (errorEl) errorEl.textContent = 'El teléfono debe contener solo números (10-15 dígitos)';
        const fieldContainer = phoneInput.closest('.checkout-form__field');
        if (fieldContainer) fieldContainer.classList.add('has-error');
        isValid = false;
      } else {
        const fieldContainer = phoneInput.closest('.checkout-form__field');
        if (fieldContainer) fieldContainer.classList.remove('has-error');
      }
    }

    return isValid;
  }

  function clearFormErrors() {
    document.querySelectorAll('.checkout-form__error').forEach(el => {
      el.textContent = '';
    });
    document.querySelectorAll('.checkout-form__field.has-error').forEach(el => {
      el.classList.remove('has-error');
    });
  }

  function buildWhatsAppMessage(order) {
    const lines = [];

    lines.push('¡Hola, Antojos del Campo! 🌾');
    lines.push('');
    lines.push('Quiero realizar el siguiente pedido:');
    lines.push('');
    lines.push('📋 *DETALLE DEL PEDIDO:*');

    order.items.forEach(item => {
      const subtotal = item.price * item.quantity;
      lines.push(`• ${item.quantity} x ${item.name} ($${formatPrice(item.price)} c/u) - $${formatPrice(item.price * item.quantity)}`);
    });

    lines.push('');
    lines.push(`💰 *SUBTOTAL PRODUCTOS:* $${formatPrice(order.subtotal)}`);
    lines.push('*(El costo del domicilio se confirmará por este medio)*');
    lines.push('');
    lines.push('📍 *DATOS DE ENVÍO:*');
    lines.push(`• *Nombre:* ${order.shipping.name}`);
    lines.push(`• *Dirección:* ${order.shipping.address}`);
    lines.push(`• *Barrio:* ${order.shipping.neighborhood}`);
    lines.push(`• *Teléfono:* ${order.shipping.phone}`);
    lines.push(`• *Método de pago:* ${formatPaymentMethod(order.paymentMethod)}`);
    lines.push(`• *Notas:* ${order.notes || 'Ninguna'}`);
    lines.push('');
    lines.push('¿Me confirman disponibilidad y valor del envío? ¡Muchas gracias!');

    return lines.join('\n');
  }

  function formatPaymentMethod(method) {
    const methods = {
      breb: 'Bre-B',
      bancolombia: 'Bancolombia',
      efectivo: 'Efectivo contra entrega'
    };
    return methods[method] || method;
  }

  // ============================================================
  // TOAST NOTIFICATIONS
  // ============================================================
  function showToast(message, type = 'success') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${type === 'success' ? '✓' : '✕'}</span>
      <span class="toast__message">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    // Forzar reflow para animación
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================================
  // UTILIDADES
  // ============================================================
  function formatPrice(amount) {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function animateAddButton(button) {
    if (!button) return;
    button.classList.add('product-card__cta--adding');
    setTimeout(() => button.classList.remove('product-card__cta--adding'), 300);
  }

  // ============================================================
  // INICIALIZACIÓN
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exponer API pública para debugging
  window.AntojosCart = {
    getCart: () => [...cart],
    addToCart,
    removeFromCart,
    clearCart,
    getCartCount,
    getSubtotal,
    openCartDrawer,
    closeCartDrawer,
    openCheckoutModal,
    closeCheckoutModal,
    showToast
  };
})();