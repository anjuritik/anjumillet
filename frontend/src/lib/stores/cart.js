// stores/cart.js
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Create cart store
function createCartStore() {
  const { subscribe, set, update } = writable([]);
  
  return {
    subscribe,
    
    // Add item to cart
    addItem: (product, quantity = 1) => {
      update(cart => {
        const existingItem = cart.find(item => item.productId === product.id);
        
        if (existingItem) {
          // Update quantity if item exists
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > product.STOCKQUANTITY) {
            throw new Error(`Cannot add more. Only ${product.STOCKQUANTITY} available!`);
          }
          existingItem.quantity = newQuantity;
        } else {
          // Add new item to cart
          cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            maxStock: product.STOCKQUANTITY
          });
        }
        
        // Save to localStorage
        if (browser) {
          localStorage.setItem('cart', JSON.stringify(cart));
        }
        
        return cart;
      });
    },
    
    // Remove item from cart
    removeItem: (productId) => {
      update(cart => {
        const filteredCart = cart.filter(item => item.productId !== productId);
        
        if (browser) {
          localStorage.setItem('cart', JSON.stringify(filteredCart));
        }
        
        return filteredCart;
      });
    },
    
    // Update item quantity
    updateQuantity: (productId, quantity) => {
      update(cart => {
        const item = cart.find(item => item.productId === productId);
        if (item) {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            return cart.filter(item => item.productId !== productId);
          } else if (quantity > item.maxStock) {
            throw new Error(`Cannot add more than ${item.maxStock} items`);
          } else {
            item.quantity = quantity;
          }
        }
        
        if (browser) {
          localStorage.setItem('cart', JSON.stringify(cart));
        }
        
        return cart;
      });
    },
    
    // Clear entire cart
    clearCart: () => {
      set([]);
      if (browser) {
        localStorage.removeItem('cart');
      }
    },
    
    // Load cart from localStorage
    loadFromStorage: () => {
      if (browser) {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          set(JSON.parse(savedCart));
        }
      }
    },
    
    // Get cart total
    getTotal: (cart) => {
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    // Get cart count
    getCount: (cart) => {
      return cart.reduce((total, item) => total + item.quantity, 0);
    }
  };
}

export const cartStore = createCartStore();

// ADD THIS: Export the cart item count as a derived store
export const cartItemCount = derived(cartStore, ($cart) => {
  return $cart.reduce((total, item) => total + item.quantity, 0);
});