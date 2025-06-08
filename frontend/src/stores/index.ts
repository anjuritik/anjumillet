// Initialize all stores
import { browser } from '$app/environment';
import { loadCartFromStorage } from './cart';
import { initAuth } from './auth';

export function initializeStores() {
  if (browser) {
    initAuth();
    loadCartFromStorage();
  }
}

// Auto-initialize when imported
initializeStores();