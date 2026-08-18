// In-memory data store (no database required)
const initialData = require('./data/initialData');

class DataStore {
  constructor() {
    this.users = [...initialData.users];
    this.services = [...initialData.services];
    this.barbers = [...initialData.barbers];
    this.appointments = [...initialData.appointments];
    this.reviews = [...initialData.reviews];
  }

  // Users
  getAllUsers() {
    return this.users.map(({ password, ...user }) => user);
  }

  getUserById(id) {
    const user = this.users.find(u => u.id === id);
    return user ? { ...user, password: undefined } : null;
  }

  getUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  createUser(userData) {
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return { ...newUser, password: undefined };
  }

  updateUser(id, updates) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...updates };
    return { ...this.users[index], password: undefined };
  }

  // Services
  getAllServices() {
    return this.services;
  }

  getServiceById(id) {
    return this.services.find(s => s.id === id);
  }

  createService(serviceData) {
    const newService = {
      id: Date.now().toString(),
      ...serviceData
    };
    this.services.push(newService);
    return newService;
  }

  updateService(id, updates) {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.services[index] = { ...this.services[index], ...updates };
    return this.services[index];
  }

  deleteService(id) {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.services.splice(index, 1);
    return true;
  }

  // Barbers
  getAllBarbers() {
    return this.barbers;
  }

  getBarberById(id) {
    return this.barbers.find(b => b.id === id);
  }

  createBarber(barberData) {
    const newBarber = {
      id: Date.now().toString(),
      ...barberData
    };
    this.barbers.push(newBarber);
    return newBarber;
  }

  updateBarber(id, updates) {
    const index = this.barbers.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.barbers[index] = { ...this.barbers[index], ...updates };
    return this.barbers[index];
  }

  deleteBarber(id) {
    const index = this.barbers.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.barbers.splice(index, 1);
    return true;
  }

  // Appointments
  getAllAppointments() {
    return this.appointments;
  }

  getAppointmentsByUserId(userId) {
    return this.appointments.filter(a => a.userId === userId);
  }

  getAppointmentsByBarberId(barberId) {
    return this.appointments.filter(a => a.barberId === barberId);
  }

  getAppointmentById(id) {
    return this.appointments.find(a => a.id === id);
  }

  isBarberAvailable(barberId, date, time, duration) {
    const appointmentDate = new Date(`${date}T${time}`);
    const appointmentEnd = new Date(appointmentDate.getTime() + duration * 60000);

    const conflictingAppointments = this.appointments.filter(a => {
      if (a.barberId !== barberId || a.status === 'cancelled') return false;
      
      const existingStart = new Date(`${a.date}T${a.time}`);
      const existingEnd = new Date(existingStart.getTime() + a.duration * 60000);

      return (appointmentDate < existingEnd && appointmentEnd > existingStart);
    });

    return conflictingAppointments.length === 0;
  }

  createAppointment(appointmentData) {
    // Check availability
    const isAvailable = this.isBarberAvailable(
      appointmentData.barberId,
      appointmentData.date,
      appointmentData.time,
      appointmentData.duration
    );

    if (!isAvailable) {
      throw new Error('This time slot is not available');
    }

    const newAppointment = {
      id: Date.now().toString(),
      status: 'pending',
      ...appointmentData,
      createdAt: new Date().toISOString()
    };
    this.appointments.push(newAppointment);
    return newAppointment;
  }

  updateAppointment(id, updates) {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    // If changing time, check availability
    if (updates.date || updates.time || updates.duration) {
      const appointment = this.appointments[index];
      const isAvailable = this.isBarberAvailable(
        appointment.barberId,
        updates.date || appointment.date,
        updates.time || appointment.time,
        updates.duration || appointment.duration
      );
      if (!isAvailable) {
        throw new Error('This time slot is not available');
      }
    }

    this.appointments[index] = { ...this.appointments[index], ...updates };
    return this.appointments[index];
  }

  cancelAppointment(id) {
    return this.updateAppointment(id, { status: 'cancelled' });
  }

  // Reviews
  getAllReviews(status = null) {
    if (status) {
      return this.reviews.filter(r => r.status === status);
    }
    return this.reviews;
  }

  getReviewsByBarberId(barberId) {
    return this.reviews.filter(r => r.barberId === barberId && r.status === 'approved');
  }

  createReview(reviewData) {
    const newReview = {
      id: Date.now().toString(),
      status: 'pending',
      ...reviewData,
      createdAt: new Date().toISOString()
    };
    this.reviews.push(newReview);
    return newReview;
  }

  updateReview(id, updates) {
    const index = this.reviews.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.reviews[index] = { ...this.reviews[index], ...updates };
    return this.reviews[index];
  }

  deleteReview(id) {
    const index = this.reviews.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.reviews.splice(index, 1);
    return true;
  }

  // Dashboard stats
  getDashboardStats() {
    const totalAppointments = this.appointments.length;
    const pendingAppointments = this.appointments.filter(a => a.status === 'pending').length;
    const confirmedAppointments = this.appointments.filter(a => a.status === 'confirmed').length;
    const cancelledAppointments = this.appointments.filter(a => a.status === 'cancelled').length;
    
    const totalRevenue = this.appointments
      .filter(a => a.status === 'confirmed' || a.status === 'completed')
      .reduce((sum, a) => sum + a.price, 0);

    const barberStats = this.barbers.map(barber => {
      const barberAppointments = this.appointments.filter(a => a.barberId === barber.id);
      return {
        barberId: barber.id,
        barberName: barber.name,
        appointmentsCount: barberAppointments.length,
        revenue: barberAppointments.filter(a => a.status === 'confirmed' || a.status === 'completed').reduce((sum, a) => sum + a.price, 0)
      };
    });

    const serviceStats = this.services.map(service => {
      const serviceAppointments = this.appointments.filter(a => a.serviceId === service.id);
      return {
        serviceId: service.id,
        serviceName: service.name,
        bookingsCount: serviceAppointments.length
      };
    }).sort((a, b) => b.bookingsCount - a.bookingsCount);

    return {
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      cancelledAppointments,
      totalRevenue,
      barberStats,
      serviceStats,
      totalClients: this.users.filter(u => u.role === 'client').length,
      totalBarbers: this.barbers.length
    };
  }
}

module.exports = new DataStore();
