import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const adminApi = {
  // User Management
  getAllUsers: async (search?: string, filter?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter) params.append('filter', filter);
    const { data } = await axios.get(`${API_BASE_URL}/admin/users${params.size ? `?${params}` : ''}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return data;
  },

  getUserDetails: async (userId: string) => {
    const { data } = await axios.get(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return data;
  },

  deleteUser: async (userId: string) => {
    const { data } = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return data;
  },

  // Prediction Monitoring
  getPredictions: async () => {
    const { data } = await axios.get(`${API_BASE_URL}/admin/predictions`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return data;
  },

  // Roadmap Tracking
  getRoadmapTracking: async () => {
    const { data } = await axios.get(`${API_BASE_URL}/admin/roadmaps`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return data;
  },

  // Analytics Overview
  getAnalytics: async () => {
    const { data } = await axios.get(`${API_BASE_URL}/admin/analytics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return data;
  },

  // Companies Management
  getCompanies: async () => {
    const { data } = await axios.get(`${API_BASE_URL}/admin/companies`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return data;
  },

  addCompany: async (name: string, requiredSkills: string[], minPredictionScore: number) => {
    const { data } = await axios.post(
      `${API_BASE_URL}/admin/companies`,
      { name, requiredSkills, minPredictionScore },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return data;
  }
};

export default adminApi;
