<!-- Cart Page Component -->
<script>
    import { onMount } from 'svelte';
    import { cartStore } from '$lib/stores/cart.js';
    import { goto } from '$app/navigation';
  
    let cart = [];
    let total = 0;
    let loading = false;
    let error = '';
    let success = '';
  
    // Subscribe to cart store
    cartStore.subscribe(value => {
      cart = value;
      total = cartStore.getTotal(cart);
    });
  
    onMount(() => {
      cartStore.loadFromStorage();
    });
  
    // Update quantity
    async function updateQuantity(productId, newQuantity) {
      try {
        cartStore.updateQuantity(productId, newQuantity);
        success = 'Cart updated successfully';
        setTimeout(() => success = '', 2000);
      } catch (err) {
        error = err.message;
        setTimeout(() => error = '', 3000);
      }
    }
  
    // Remove item
    function removeItem(productId) {
      cartStore.removeItem(productId);
      success = 'Item removed from cart';
      setTimeout(() => success = '', 2000);
    }
  
    // Clear cart
    function clearCart() {
      if (confirm('Are you sure you want to clear your cart?')) {
        cartStore.clearCart();
        success = 'Cart cleared successfully';
        setTimeout(() => success = '', 2000);
      }
    }
  
    // Proceed to checkout
    /* async function proceedToCheckout() {
      if (cart.length === 0) {
        error = 'Your cart is empty';
        setTimeout(() => error = '', 3000);
        return;
      }
  
      loading = true;
      
      try {
        // Here you would typically:
        // 1. Validate cart items against current stock
        // 2. Calculate final total with taxes/shipping
        // 3. Redirect to checkout/payment page
        
        // For now, just simulate the process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to checkout page
        goto('/checkout');
        
      } catch (err) {
        error = 'Failed to proceed to checkout';
        setTimeout(() => error = '', 3000);
      } finally {
        loading = false;
      }
    } */
    async function proceedToCheckout() {
  if (cart.length === 0) {
    error = 'Your cart is empty';
    setTimeout(() => error = '', 3000);
    return;
  }

  loading = true;
  error = '';

  try {
    // 1. Validate cart items against current stock
    const stockValidation = await validateCartStock();
    if (!stockValidation.valid) {
      error = stockValidation.message;
      setTimeout(() => error = '', 5000);
      return;
    }

    // 2. Get user authentication token
    const token = localStorage.getItem('authToken');
    if (!token) {
      error = 'Please login to proceed with checkout';
      setTimeout(() => error = '', 3000);
      // Redirect to login page
      goto('/login?redirect=' + encodeURIComponent('/cart'));
      return;
    }

    // 3. Prepare order data
    const orderData = {
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: getShippingAddress(), // You'll need to implement this
      paymentMethod: getPaymentMethod(), // You'll need to implement this
      totalAmount: calculateTotal()
    };

    // 4. Create order in database
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }

    const orderResult = await response.json();

    // 5. Clear cart after successful order
    cartStore.clearCart();

    // 6. Show success message and redirect
    success = `Order created successfully! Order ID: ${orderResult.orderId}`;
    
    // Redirect to order confirmation page
    setTimeout(() => {
      goto(`/orders/${orderResult.orderId}`);
    }, 2000);

  } catch (err) {
    console.error('Checkout error:', err);
    error = err.message || 'Failed to proceed to checkout';
    setTimeout(() => error = '', 5000);
  } finally {
    loading = false;
  }
}

// Helper function to validate cart stock
async function validateCartStock() {
  try {
    for (const item of cart) {
      const response = await fetch(`/api/products/${item.productId}`);
      if (!response.ok) {
        return {
          valid: false,
          message: `Product ${item.name} is no longer available`
        };
      }

      const product = await response.json();
      
      if (product.STOCKQUANTITY < item.quantity) {
        return {
          valid: false,
          message: `Only ${product.STOCKQUANTITY} units of ${item.name} available. Please update your cart.`
        };
      }
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      message: 'Unable to validate cart items. Please try again.'
    };
  }
}

// Helper function to get shipping address (implement based on your UI)
function getShippingAddress() {
  // This should get the shipping address from your form/UI
  // For now, return a default structure
  return {
    fullName: 'John Doe', // Get from form
    address: '123 Main St', // Get from form
    city: 'City Name', // Get from form
    state: 'State Name', // Get from form
    zipCode: '12345', // Get from form
    country: 'India', // Get from form
    phone: '1234567890' // Get from form
  };
}

// Helper function to get payment method (implement based on your UI)
function getPaymentMethod() {
  // This should get the payment method from your form/UI
  // For now, return a default value
  return 'cash_on_delivery'; // or 'credit_card', 'upi', etc.
}

// Helper function to calculate total
function calculateTotal() {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  return subtotal + tax + shipping;
}

// Alternative: Complete checkout function with shipping/payment form
async function proceedToCheckoutWithForm() {
  if (cart.length === 0) {
    error = 'Your cart is empty';
    setTimeout(() => error = '', 3000);
    return;
  }

  // Check if user is logged in
  const token = localStorage.getItem('authToken');
  if (!token) {
    error = 'Please login to proceed with checkout';
    setTimeout(() => error = '', 3000);
    goto('/login?redirect=' + encodeURIComponent('/cart'));
    return;
  }

  // Redirect to checkout page with form for shipping/payment details
  goto('/checkout');
}

// Complete checkout page function (for /checkout route)
async function completeOrder(shippingData, paymentData) {
  loading = true;
  error = '';

  try {
    const token = localStorage.getItem('authToken');
    
    const orderData = {
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: shippingData,
      paymentMethod: paymentData.method,
      totalAmount: calculateTotalWithTaxAndShipping()
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }

    const orderResult = await response.json();
    
    // Clear cart
    cartStore.clearCart();
    
    // Redirect to success page
    goto(`/order-success/${orderResult.orderId}`);

  } catch (err) {
    console.error('Order creation error:', err);
    error = err.message || 'Failed to create order';
    setTimeout(() => error = '', 5000);
  } finally {
    loading = false;
  }
}

function calculateTotalWithTaxAndShipping() {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  return Math.round((subtotal + tax + shipping) * 100) / 100; // Round to 2 decimal places
}
  </script>
  
  <div class="cart-container">
    <h1>Shopping Cart</h1>
  
    <!-- Messages -->
    {#if error}
      <div class="message error">{error}</div>
    {/if}
    
    {#if success}
      <div class="message success">{success}</div>
    {/if}
  
    {#if cart.length === 0}
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some products to your cart to get started!</p>
        <button class="continue-shopping-btn" on:click={() => goto('/products')}>
          Continue Shopping
        </button>
      </div>
    {:else}
      <div class="cart-content">
        <!-- Cart Items -->
        <div class="cart-items">
          {#each cart as item}
            <div class="cart-item">
              <img src={item.image} alt={item.name} class="item-image" />
              
              <div class="item-details">
                <h3>{item.name}</h3>
                <p class="item-price">₹{item.price} each</p>
              </div>
  
              <div class="quantity-controls">
                <button 
                  class="qty-btn" 
                  on:click={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max={item.maxStock}
                  value={item.quantity}
                  on:change={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                  class="qty-input"
                />
                <button 
                  class="qty-btn" 
                  on:click={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.maxStock}
                >
                  +
                </button>
              </div>
  
              <div class="item-total">
                <strong>₹{item.price * item.quantity}</strong>
              </div>
  
              <button 
                class="remove-btn"
                on:click={() => removeItem(item.productId)}
                title="Remove item"
              >
                🗑️
              </button>
            </div>
          {/each}
        </div>
  
        <!-- Cart Summary -->
        <div class="cart-summary">
          <div class="summary-content">
            <h3>Order Summary</h3>
            
            <div class="summary-row">
              <span>Items ({cartStore.getCount(cart)})</span>
              <span>₹{total}</span>
            </div>
            
            <div class="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            
            <div class="summary-row total">
              <strong>Total: ₹{total}</strong>
            </div>
  
            <button 
              class="checkout-btn" 
              on:click={proceedToCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
  
            <button class="clear-cart-btn" on:click={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>
      </div>
  
      <div class="cart-actions">
        <button class="continue-shopping-btn" on:click={() => goto('/products')}>
          ← Continue Shopping
        </button>
      </div>
    {/if}
  </div>
  
  <style>
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
  
    .cart-container h1 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }
  
    .message {
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }
  
    .message.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
  
    .message.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
  
    .empty-cart {
      text-align: center;
      padding: 3rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
  
    .empty-cart h2 {
      color: #666;
      margin-bottom: 1rem;
    }
  
    .cart-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }
  
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    .cart-item {
      display: grid;
      grid-template-columns: 80px 1fr auto auto auto;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
    }
  
    .item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }
  
    .item-details h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }
  
    .item-price {
      color: #666;
      margin: 0;
    }
  
    .quantity-controls {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
  
    .qty-btn {
      background: #f5f5f5;
      border: none;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-weight: bold;
    }
  
    .qty-btn:hover:not(:disabled) {
      background: #e0e0e0;
    }
  
    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  
    .qty-input {
      width: 50px;
      height: 30px;
      text-align: center;
      border: none;
      outline: none;
    }
  
    .item-total {
      font-size: 1.1rem;
      color: #2c5aa0;
    }
  
    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.5rem;
      border-radius: 4px;
    }
  
    .remove-btn:hover {
      background: #f0f0f0;
    }
  
    .cart-summary {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 2rem;
    }
  
    .summary-content h3 {
      margin-top: 0;
      color: #333;
    }
  
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      padding: 0.5rem 0;
    }
  
    .summary-row.total {
      border-top: 1px solid #ddd;
      padding-top: 1rem;
      margin-top: 1rem;
      font-size: 1.2rem;
    }
  
    .checkout-btn {
      width: 100%;
      background: #4CAF50;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 500;
      margin-top: 1rem;
    }
  
    .checkout-btn:hover:not(:disabled) {
      background: #45a049;
    }
  
    .checkout-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  
    .clear-cart-btn {
      width: 100%;
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.7rem;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 0.5rem;
    }
  
    .clear-cart-btn:hover {
      background: #c82333;
    }
  
    .continue-shopping-btn {
      background: #2c5aa0;
      color: white;
      border: none;
      padding: 0.7rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
  
    .continue-shopping-btn:hover {
      background: #1e3f73;
    }
  
    .cart-actions {
      margin-top: 2rem;
      text-align: center;
    }
  
    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }
  
      .cart-item {
        grid-template-columns: 60px 1fr;
        gap: 0.5rem;
      }
  
      .quantity-controls,
      .item-total,
      .remove-btn {
        grid-column: 1 / -1;
        justify-self: start;
        margin-top: 0.5rem;
      }
  
      .item-total {
        justify-self: center;
      }
  
      .remove-btn {
        justify-self: end;
      }
    }
  </style>