import axios from  "axios";
import type { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  Product, 
  User 
} from './types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: RegisterData): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const productAPI = {
  getAll: async (): Promise<Product[]> => {
    const response: AxiosResponse<Product[]> = await api.get('/products');
    return response.data;
  },
  
  getById: async (id: number): Promise<Product> => {
    const response: AxiosResponse<Product> = await api.get(`/products/${id}`);
    return response.data;
  },
};

export default api;