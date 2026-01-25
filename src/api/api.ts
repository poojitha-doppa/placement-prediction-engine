import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Token added to request:', config.url);
  } else {
    console.warn('⚠️ No token found in localStorage');
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login page and not on a public route
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('placement_user');
        // Don't redirect immediately, let the component handle it
        console.warn('Authentication failed. Please log in again.');
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  signup: async (email: string, password: string, name?: string) => {
    const { data } = await api.post('/auth/signup', { email, password, name });
    return data;
  },
  
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
  },
};

// Profile APIs
export const profileApi = {
  getProfile: async () => {
    const { data } = await api.get('/api/profile');
    return data;
  },
  
  updateProfile: async (updates: any) => {
    const { data } = await api.put('/api/profile', updates);
    return data.profile;
  },
  
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const { data } = await api.post('/api/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

// Roadmap APIs
export const roadmapApi = {
  getRoadmap: async () => {
    const { data } = await api.get('/api/roadmap');
    return data;
  },
  
  logProgress: async (progressData: {
    weekNumber: number;
    completionPercent: number;
    taskId?: string;
    hoursSpent?: number;
    notes?: string;
  }) => {
    const { data } = await api.post('/api/roadmap/progress', progressData);
    return data;
  },
  
  getProgressHistory: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/api/roadmap/progress-history', {
      params: { startDate, endDate },
    });
    return data;
  },
};

// Analytics APIs
export const analyticsApi = {
  getPlacementSummary: async () => {
    const { data } = await api.get('/api/placement-summary');
    return data;
  },
  
  getSkillAnalytics: async () => {
    const { data } = await api.get('/api/skill-analytics');
    return data;
  },
  
  getCompanyMatches: async () => {
    const { data } = await api.get('/api/company-matches');
    return data;
  },
  
  getOptimizationInsights: async () => {
    const { data } = await api.get('/api/optimization-insights');
    return data;
  },
};

// Agent APIs
export const agentApi = {
  generateRoadmap: async (forceRegenerate = false) => {
    const { data } = await api.post('/agent/generate-roadmap', { forceRegenerate });
    return data;
  },
  
  getDashboardInsights: async () => {
    const { data } = await api.get('/agent/dashboard-insights');
    return data;
  },
};

export default api;
