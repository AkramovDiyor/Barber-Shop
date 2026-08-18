const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const store = require('../data/store');

const router = express.Router();

// Get all appointments (admin only)
router.get('/', adminMiddleware, (req, res) => {
  try {
    const appointments = store.getAllAppointments();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's appointments (authenticated user)
router.get('/my', authMiddleware, (req, res) => {
  try {
    const appointments = store.getAppointmentsByUserId(req.user.id);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get barber's appointments (barber or admin)
router.get('/barber/:barberId', authMiddleware, (req, res) => {
  try {
    // Only allow barbers to see their own appointments, admins can see all
    if (req.user.role === 'barber' && req.params.barberId !== req.user.barberId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const appointments = store.getAppointmentsByBarberId(req.params.barberId);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Check barber availability
router.post('/check-availability', (req, res) => {
  try {
    const { barberId, date, time, duration } = req.body;
    
    if (!barberId || !date || !time || !duration) {
      return res.status(400).json({ error: 'Barber ID, date, time and duration are required' });
    }

    const isAvailable = store.isBarberAvailable(barberId, date, time, parseInt(duration));
    res.json({ available: isAvailable });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create appointment (authenticated users)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { serviceId, barberId, date, time, name, phone, notes } = req.body;
    
    if (!serviceId || !barberId || !date || !time) {
      return res.status(400).json({ error: 'Service, barber, date and time are required' });
    }

    const service = store.getServiceById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const appointment = store.createAppointment({
      userId: req.user.id,
      serviceId,
      barberId,
      date,
      time,
      duration: service.duration,
      price: service.price,
      clientName: name || req.user.name,
      clientPhone: phone || req.user.phone,
      clientEmail: req.user.email,
      notes: notes || ''
    });
    
    res.status(201).json(appointment);
  } catch (error) {
    if (error.message === 'This time slot is not available') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Get appointment by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const appointment = store.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Users can only see their own appointments unless admin
    if (req.user.role !== 'admin' && appointment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update appointment status (admin only)
router.patch('/:id/status', adminMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = store.updateAppointment(req.params.id, { status });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    if (error.message === 'This time slot is not available') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel appointment (user or admin)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const appointment = store.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Users can only cancel their own appointments unless admin
    if (req.user.role !== 'admin' && appointment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = store.cancelAppointment(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
