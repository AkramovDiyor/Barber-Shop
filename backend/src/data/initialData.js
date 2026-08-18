// Initial data for in-memory storage
const bcrypt = require('bcryptjs');

// Hash passwords for initial users
const adminPasswordHash = bcrypt.hashSync('admin123', 10);
const userPasswordHash = bcrypt.hashSync('user123', 10);

const users = [
  {
    id: '1',
    email: 'admin@barbershop.com',
    password: adminPasswordHash,
    name: 'Admin User',
    phone: '+1234567890',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'user@example.com',
    password: userPasswordHash,
    name: 'John Doe',
    phone: '+1987654321',
    role: 'client',
    createdAt: new Date().toISOString()
  }
];

const services = [
  {
    id: '1',
    name: 'Мужская стрижка',
    description: 'Классическая мужская стрижка с мытьем головы и укладкой',
    price: 1500,
    duration: 60,
    image: '/images/service-haircut.jpg'
  },
  {
    id: '2',
    name: 'Стрижка бороды',
    description: 'Моделирование и стрижка бороды с распариванием',
    price: 800,
    duration: 30,
    image: '/images/service-beard.jpg'
  },
  {
    id: '3',
    name: 'Комплекс "Отец и сын"',
    description: 'Стрижка для отца и сына до 12 лет',
    price: 2500,
    duration: 90,
    image: '/images/service-father-son.jpg'
  },
  {
    id: '4',
    name: 'Детская стрижка',
    description: 'Стрижка для детей до 12 лет с игровым моментом',
    price: 1000,
    duration: 45,
    image: '/images/service-kids.jpg'
  }
];

const barbers = [
  {
    id: '1',
    name: 'Александр Петров',
    specialization: 'Топ-барбер',
    rating: 4.9,
    experience: 8,
    image: '/images/barber-1.jpg',
    schedule: {
      monday: { start: '10:00', end: '20:00' },
      tuesday: { start: '10:00', end: '20:00' },
      wednesday: { start: '10:00', end: '20:00' },
      thursday: { start: '10:00', end: '20:00' },
      friday: { start: '10:00', end: '20:00' },
      saturday: { start: '11:00', end: '18:00' },
      sunday: null // Выходной
    }
  },
  {
    id: '2',
    name: 'Дмитрий Иванов',
    specialization: 'Барбер',
    rating: 4.7,
    experience: 5,
    image: '/images/barber-2.jpg',
    schedule: {
      monday: { start: '12:00', end: '22:00' },
      tuesday: { start: '12:00', end: '22:00' },
      wednesday: { start: '12:00', end: '22:00' },
      thursday: { start: '12:00', end: '22:00' },
      friday: { start: '12:00', end: '22:00' },
      saturday: { start: '12:00', end: '22:00' },
      sunday: { start: '12:00', end: '20:00' }
    }
  },
  {
    id: '3',
    name: 'Максим Сидоров',
    specialization: 'Мастер',
    rating: 4.8,
    experience: 3,
    image: '/images/barber-3.jpg',
    schedule: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' },
      saturday: null,
      sunday: null
    }
  }
];

const appointments = [];

const reviews = [
  {
    id: '1',
    userId: '2',
    userName: 'John Doe',
    barberId: '1',
    barberName: 'Александр Петров',
    rating: 5,
    comment: 'Отличный барбер! Стрижка супер, обязательно вернусь.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: '2',
    userId: '2',
    userName: 'John Doe',
    barberId: '2',
    barberName: 'Дмитрий Иванов',
    rating: 4,
    comment: 'Хорошая работа, но немного долго.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

module.exports = {
  users,
  services,
  barbers,
  appointments,
  reviews
};
