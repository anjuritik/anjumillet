// User related types
export interface User {
    id: number;
    username: string;
    email: string;
    created_at?: string;
  }
  
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  export interface RegisterData {
    username: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  // Product related types
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    stock_quantity: number;
    created_at: string;
  }
  
  // API response types
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
  
  // Cart related types
  export interface CartItem {
    product: Product;
    quantity: number;
  }
  
  export interface Cart {
    items: CartItem[];
    total: number;
  }