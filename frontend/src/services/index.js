import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const serviceService = {
  getAll: async () => {
    const response = await api.get('/services');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  }
};

export const barberService = {
  getAll: async () => {
    const response = await api.get('/barbers');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/barbers/${id}`);
    return response.data;
  },

  getSchedule: async (id) => {
    const response = await api.get(`/barbers/${id}/schedule`);
    return response.data;
  },

  checkAvailability: async (id, date, startTime, endTime) => {
    const response = await api.get(`/barbers/${id}/availability`, {
      params: { date, start_time: startTime, end_time: endTime }
    });
    return response.data;
  }
};

export const appointmentService = {
  create: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  getMyAppointments: async (status) => {
    const response = await api.get('/appointments/my', { params: { status } });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  cancel: async (id, reason) => {
    const response = await api.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  }
};

export const reviewService = {
  create: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  getBarberReviews: async (barberId, limit = 100) => {
    const response = await api.get(`/reviews/barber/${barberId}`, { params: { limit } });
    return response.data;
  }
};
