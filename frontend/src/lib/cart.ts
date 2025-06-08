import { writable, type Writable } from 'svelte/store';
import type { User } from '../types';
import { browser } from '$app/environment';

export const user: Writable<User | null> = writable(null);
export const token: Writable<string | null> = writable(null);
export const isAuthenticated: Writable<boolean> = writable(false);

export function setAuth(userData: User, userToken: string): void {
  user.set(userData);
  token.set(userToken);
  isAuthenticated.set(true);
  
  if (browser) {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }
}

export function clearAuth(): void {
  user.set(null);
  token.set(null);
  isAuthenticated.set(false);
  
  if (browser) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// Initialize auth state from localStorage
export function initAuth(): void {
  if (browser) {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const userData: User = JSON.parse(storedUser);
        token.set(storedToken);
        user.set(userData);
        isAuthenticated.set(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        clearAuth();
      }
    }
  }
}