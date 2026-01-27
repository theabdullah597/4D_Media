import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests if available
// Add auth token to requests if available
api.interceptors.request.use((config) => {
    // Determine which token to use based on the request URL
    const isAdminRequest = config.url?.includes('/admin');
    const token = isAdminRequest
        ? localStorage.getItem('adminToken')
        : localStorage.getItem('userToken');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// API Functions
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/auth/me'),
    changePassword: (data) => api.put('/auth/change-password', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data)
};

export const productsAPI = {
    getAll: (category = null) => api.get('/products', { params: { category } }),
    getById: (id) => api.get(`/products/${id}`),
    getCategories: () => api.get('/products/categories')
};

export const ordersAPI = {
    create: (formData) => api.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getWhatsAppLink: (orderId) => api.post(`/orders/${orderId}/whatsapp`)
};

export const adminAPI = {
    login: (credentials) => api.post('/admin/login', credentials),
    getStats: () => api.get('/admin/stats'),
    changePassword: (data) => api.put('/admin/change-password', data),

    // Orders
    getOrders: (filters = {}) => api.get('/admin/orders', { params: filters }),
    getOrderById: (id) => api.get(`/admin/orders/${id}`),
    updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
    exportOrders: (filters = {}) => api.get('/admin/orders/export', {
        params: filters,
        responseType: 'blob'
    }),
    deleteOrder: (id) => api.delete(`/admin/orders/${id}`),

    // Products
    getProducts: () => api.get('/admin/products'),
    addProduct: (product) => api.post('/admin/products', product, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateProduct: (id, product) => api.put(`/admin/products/${id}`, product, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),

    // Analytics
    getRevenueAnalytics: () => api.get('/admin/analytics/revenue'),
    getProductAnalytics: () => api.get('/admin/analytics/products')
};

export const generalAPI = {
    contact: (data) => api.post('/general/contact', data)
};

export default api;
