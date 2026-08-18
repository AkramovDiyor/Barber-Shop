// Mock API service - работает без backend, использует localStorage
import api from './api';

// Имитация задержки сети
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Начальные данные
const initialServices = [
  { id: 1, name: 'Hair Styling', description: 'Professional hair styling with premium products for any occasion.', price: 30, duration: 45, image: '/pic-1.jpeg' },
  { id: 2, name: 'Beard Trim', description: 'Precision beard trimming and shaping for a perfect look.', price: 20, duration: 30, image: '/pic-2.jpeg' },
  { id: 3, name: 'Hair Cut', description: 'Classic or modern haircut tailored to your style preferences.', price: 25, duration: 40, image: '/pic-3.jpeg' },
  { id: 4, name: 'Dry Shampoo', description: 'Quick hair cleaning without water for a fresh look.', price: 15, duration: 20, image: '/pic-4.jpeg' }
];

const initialBarbers = [
  { id: 1, name: 'John Smith', specialty: 'Master Barber', rating: 4.9, experience: '8 years', image: '/barber-man.jpeg', schedule: { mon: { start: '09:00', end: '21:00' }, tue: { start: '09:00', end: '21:00' }, wed: { start: '09:00', end: '21:00' }, thu: { start: '09:00', end: '21:00' }, fri: { start: '09:00', end: '21:00' }, sat: { start: '08:00', end: '23:00' }, sun: { start: '08:00', end: '23:00' } } },
  { id: 2, name: 'Mike Johnson', specialty: 'Senior Barber', rating: 4.8, experience: '6 years', image: '/barber-man.jpeg', schedule: { mon: { start: '09:00', end: '21:00' }, tue: { start: '09:00', end: '21:00' }, wed: { start: '09:00', end: '21:00' }, thu: { start: '09:00', end: '21:00' }, fri: { start: '09:00', end: '21:00' }, sat: { start: '08:00', end: '23:00' }, sun: { start: '08:00', end: '23:00' } } },
  { id: 3, name: 'Alex Brown', specialty: 'Barber', rating: 4.7, experience: '4 years', image: '/barber-man.jpeg', schedule: { mon: { start: '09:00', end: '21:00' }, tue: { start: '09:00', end: '21:00' }, wed: { start: '09:00', end: '21:00' }, thu: { start: '09:00', end: '21:00' }, fri: { start: '09:00', end: '21:00' }, sat: { start: '08:00', end: '23:00' }, sun: { start: '08:00', end: '23:00' } } }
];

const initialReviews = [
  { id: 1, barberId: 1, clientId: 1, clientName: 'Ken Norman', rating: 5, comment: 'Best barbershop in town! The staff is professional and the atmosphere is amazing. Highly recommend!', date: '2024-01-15', approved: true },
  { id: 2, barberId: 2, clientId: 2, clientName: 'Liara Karian', rating: 5, comment: 'Great service and attention to detail. My husband always looks fantastic after his visits here.', date: '2024-01-20', approved: true },
  { id: 3, barberId: 3, clientId: 3, clientName: 'Ricky Danial', rating: 5, comment: "I've been coming here for years. Consistent quality and friendly service every time. Worth every penny!", date: '2024-02-01', approved: true }
];

// Helper функции
const getStoredData = (key, initialData) => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
};

const setStoredData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const authService = {
  register: async (userData) => {
    await delay(300);
    const users = getStoredData('users', []);
    
    // Проверка существующего пользователя
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }
    
    const newUser = {
      id: users.length + 1,
      ...userData,
      role: 'client',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    setStoredData('users', users);
    
    // Автоматический вход после регистрации
    const token = 'mock-token-' + Date.now();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }));
    
    return { success: true, data: { user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }, token } };
  },

  login: async (credentials) => {
    await delay(300);
    const users = getStoredData('users', []);
    
    // Создаем админа по умолчанию если нет пользователей
    if (users.length === 0) {
      const adminUser = { id: 1, name: 'Admin', email: 'admin@barbershop.com', password: 'admin123', role: 'admin' };
      users.push(adminUser);
      setStoredData('users', users);
    }
    
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    const token = 'mock-token-' + Date.now();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role }));
    
    return { success: true, data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token } };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    await delay(200);
    const userStr = localStorage.getItem('user');
    if (!userStr) return { success: false, message: 'Not authenticated' };
    return { success: true, data: JSON.parse(userStr) };
  },

  updateProfile: async (profileData) => {
    await delay(300);
    const userStr = localStorage.getItem('user');
    if (!userStr) return { success: false, message: 'Not authenticated' };
    
    const currentUser = JSON.parse(userStr);
    const users = getStoredData('users', []);
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) return { success: false, message: 'User not found' };
    
    users[userIndex] = { ...users[userIndex], ...profileData };
    setStoredData('users', users);
    
    const updatedUser = { id: users[userIndex].id, email: users[userIndex].email, name: users[userIndex].name, role: users[userIndex].role };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return { success: true, data: updatedUser };
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
    await delay(200);
    const services = getStoredData('services', initialServices);
    return { success: true, data: services };
  },

  getById: async (id) => {
    await delay(200);
    const services = getStoredData('services', initialServices);
    const service = services.find(s => s.id === parseInt(id));
    if (!service) return { success: false, message: 'Service not found' };
    return { success: true, data: service };
  }
};

export const barberService = {
  getAll: async () => {
    await delay(200);
    const barbers = getStoredData('barbers', initialBarbers);
    return { success: true, data: barbers };
  },

  getById: async (id) => {
    await delay(200);
    const barbers = getStoredData('barbers', initialBarbers);
    const barber = barbers.find(b => b.id === parseInt(id));
    if (!barber) return { success: false, message: 'Barber not found' };
    return { success: true, data: barber };
  },

  getSchedule: async (id) => {
    await delay(200);
    const barbers = getStoredData('barbers', initialBarbers);
    const barber = barbers.find(b => b.id === parseInt(id));
    if (!barber) return { success: false, message: 'Barber not found' };
    return { success: true, data: barber.schedule || {} };
  },

  checkAvailability: async (id, date, startTime, endTime) => {
    await delay(300);
    const appointments = getStoredData('appointments', []);
    const barbers = getStoredData('barbers', initialBarbers);
    const barber = barbers.find(b => b.id === parseInt(id));
    
    if (!barber) return { success: false, message: 'Barber not found' };
    
    // Проверка рабочего дня
    const dateObj = new Date(date);
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayName = days[dateObj.getDay()];
    const schedule = barber.schedule[dayName];
    
    if (!schedule) {
      return { success: true, available: false, message: 'Barber is not working on this day' };
    }
    
    // Проверка существующих записей
    const conflictingAppointments = appointments.filter(app => 
      app.barberId === parseInt(id) && 
      app.date === date && 
      app.status !== 'cancelled' &&
      !(endTime <= app.startTime || startTime >= app.endTime)
    );
    
    if (conflictingAppointments.length > 0) {
      return { success: true, available: false, message: 'Time slot is already booked' };
    }
    
    return { success: true, available: true };
  }
};

export const appointmentService = {
  create: async (appointmentData) => {
    await delay(400);
    const appointments = getStoredData('appointments', []);
    
    // Проверка доступности
    const availability = await barberService.checkAvailability(
      appointmentData.barberId, 
      appointmentData.date, 
      appointmentData.startTime, 
      appointmentData.endTime
    );
    
    if (!availability.available) {
      return { success: false, message: availability.message };
    }
    
    const newAppointment = {
      id: appointments.length + 1,
      ...appointmentData,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    setStoredData('appointments', appointments);
    
    return { success: true, data: newAppointment };
  },

  getMyAppointments: async (status) => {
    await delay(300);
    const userStr = localStorage.getItem('user');
    if (!userStr) return { success: false, message: 'Not authenticated' };
    
    const currentUser = JSON.parse(userStr);
    let appointments = getStoredData('appointments', []);
    
    let filtered = appointments.filter(a => a.clientId === currentUser.id);
    
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    
    // Добавляем информацию об услуге и барбере
    const services = getStoredData('services', initialServices);
    const barbers = getStoredData('barbers', initialBarbers);
    
    const enriched = filtered.map(app => ({
      ...app,
      serviceName: services.find(s => s.id === app.serviceId)?.name || 'Unknown',
      barberName: barbers.find(b => b.id === app.barberId)?.name || 'Unknown'
    }));
    
    return { success: true, data: enriched };
  },

  getById: async (id) => {
    await delay(200);
    const appointments = getStoredData('appointments', []);
    const appointment = appointments.find(a => a.id === parseInt(id));
    if (!appointment) return { success: false, message: 'Appointment not found' };
    return { success: true, data: appointment };
  },

  cancel: async (id, reason) => {
    await delay(300);
    const appointments = getStoredData('appointments', []);
    const index = appointments.findIndex(a => a.id === parseInt(id));
    
    if (index === -1) return { success: false, message: 'Appointment not found' };
    
    appointments[index].status = 'cancelled';
    appointments[index].cancelReason = reason;
    setStoredData('appointments', appointments);
    
    return { success: true, message: 'Appointment cancelled' };
  },

  getAll: async (filters) => {
    await delay(300);
    let appointments = getStoredData('appointments', []);
    
    if (filters?.status) {
      appointments = appointments.filter(a => a.status === filters.status);
    }
    
    if (filters?.barberId) {
      appointments = appointments.filter(a => a.barberId === parseInt(filters.barberId));
    }
    
    const services = getStoredData('services', initialServices);
    const barbers = getStoredData('barbers', initialBarbers);
    const users = getStoredData('users', []);
    
    const enriched = appointments.map(app => ({
      ...app,
      serviceName: services.find(s => s.id === app.serviceId)?.name || 'Unknown',
      barberName: barbers.find(b => b.id === app.barberId)?.name || 'Unknown',
      clientName: users.find(u => u.id === app.clientId)?.name || 'Unknown',
      clientEmail: users.find(u => u.id === app.clientId)?.email || 'Unknown'
    }));
    
    return { success: true, data: enriched };
  }
};

export const reviewService = {
  create: async (reviewData) => {
    await delay(300);
    const reviews = getStoredData('reviews', initialReviews);
    
    const newReview = {
      id: reviews.length + 1,
      ...reviewData,
      date: new Date().toISOString().split('T')[0],
      approved: false // Требуется модерация
    };
    
    reviews.push(newReview);
    setStoredData('reviews', reviews);
    
    return { success: true, data: newReview };
  },

  getBarberReviews: async (barberId, limit = 100) => {
    await delay(200);
    let reviews = getStoredData('reviews', initialReviews);
    
    reviews = reviews.filter(r => r.barberId === parseInt(barberId) && r.approved);
    reviews = reviews.slice(0, limit);
    
    return { success: true, data: reviews };
  },

  getAll: async () => {
    await delay(200);
    const reviews = getStoredData('reviews', initialReviews);
    const barbers = getStoredData('barbers', initialBarbers);
    
    const enriched = reviews.map(r => ({
      ...r,
      barberName: barbers.find(b => b.id === r.barberId)?.name || 'Unknown'
    }));
    
    return { success: true, data: enriched };
  },

  approve: async (id) => {
    await delay(200);
    const reviews = getStoredData('reviews', initialReviews);
    const index = reviews.findIndex(r => r.id === parseInt(id));
    
    if (index === -1) return { success: false, message: 'Review not found' };
    
    reviews[index].approved = true;
    setStoredData('reviews', reviews);
    
    return { success: true };
  },

  delete: async (id) => {
    await delay(200);
    let reviews = getStoredData('reviews', initialReviews);
    reviews = reviews.filter(r => r.id !== parseInt(id));
    setStoredData('reviews', reviews);
    
    return { success: true };
  }
};

// Admin сервисы
export const adminService = {
  getDashboardStats: async () => {
    await delay(300);
    const appointments = getStoredData('appointments', []);
    const services = getStoredData('services', initialServices);
    const barbers = getStoredData('barbers', initialBarbers);
    const users = getStoredData('users', []);
    
    const totalAppointments = appointments.length;
    const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
    
    const totalRevenue = appointments
      .filter(a => a.status === 'confirmed')
      .reduce((sum, app) => {
        const service = services.find(s => s.id === app.serviceId);
        return sum + (service?.price || 0);
      }, 0);
    
    const topServices = services.map(s => ({
      name: s.name,
      count: appointments.filter(a => a.serviceId === s.id && a.status === 'confirmed').length
    })).sort((a, b) => b.count - a.count).slice(0, 5);
    
    return { 
      success: true, 
      data: {
        totalAppointments,
        confirmedAppointments,
        cancelledAppointments,
        totalRevenue,
        totalClients: users.filter(u => u.role === 'client').length,
        totalBarbers: barbers.length,
        topServices
      }
    };
  },

  exportToCSV: async (type) => {
    await delay(300);
    let data = [];
    let filename = '';
    
    if (type === 'appointments') {
      data = getStoredData('appointments', []);
      filename = 'appointments.csv';
    } else if (type === 'clients') {
      data = getStoredData('users', []).filter(u => u.role === 'client');
      filename = 'clients.csv';
    } else if (type === 'reviews') {
      data = getStoredData('reviews', initialReviews);
      filename = 'reviews.csv';
    }
    
    return { success: true, data, filename };
  }
};
