import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// User store
export const user = writable(null);

// Derived store for authentication status
export const isAuthenticated = derived(user, $user => !!$user);

// Initialize authentication - check for existing session
export function initAuth() {
    if (browser) {
        // Check localStorage for existing auth data
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        
        if (storedUser && token) {
            try {
                const userData = JSON.parse(storedUser);
                user.set(userData);
            } catch (error) {
                console.error('Failed to parse stored user data:', error);
                clearAuth();
            }
        }
    }
}

// Clear authentication data
export function clearAuth() {
    user.set(null);
    
    if (browser) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
    }
}

// Login function
export function login(userData, token) {
    user.set(userData);
    
    if (browser) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', token);
    }
}

// Alias for login (if you prefer setAuth naming)
export const setAuth = login;