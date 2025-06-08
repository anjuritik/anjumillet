import { writable, derived, type Writable, type Readable } from 'svelte/store';
import type { CartItem, Product } from '../types';
import { browser } from '$app/environment';

export const cartItems: Writable<CartItem[]> = writable([]);

// Derived store for cart total
export const cartTotal: Readable<number> = derived(
  cartItems,
  ($cartItems) => $cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
);

// Derived store for cart item count
export const cartItemCount: Readable<number> = derived(
  cartItems,
  ($cartItems) => $cartItems.reduce((count, item) => count + item.quantity, 0)
);

export function addToCart(product: Product, quantity: number = 1): void {
  cartItems.update(items => {
    const existingItem = items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      return items;
    } else {
      return [...items, { product, quantity }];
    }
  });
  
  saveCartToStorage();
}

export function removeFromCart(productId: number): void {
  cartItems.update(items => items.filter(item => item.product.id !== productId));
  saveCartToStorage();
}

export function updateCartItemQuantity(productId: number, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  cartItems.update(items => {
    const item = items.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
    }
    return items;
  });
  
  saveCartToStorage();
}

export function clearCart(): void {
  cartItems.set([]);
  saveCartToStorage();
}

function saveCartToStorage(): void {
  if (browser) {
    cartItems.subscribe(items => {
      localStorage.setItem('cart', JSON.stringify(items));
    })();
  }
}

export function loadCartFromStorage(): void {
  if (browser) {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const items: CartItem[] = JSON.parse(storedCart);
        cartItems.set(items);
      } catch (error) {
        console.error('Error parsing stored cart data:', error);
        cartItems.set([]);
      }
    }
  }
}