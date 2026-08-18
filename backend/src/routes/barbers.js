const express = require('express');
const { adminMiddleware } = require('../middleware/auth');
const store = require('../data/store');

const router = express.Router();

// Get all barbers (public)
router.get('/', (req, res) => {
  try {
    const barbers = store.getAllBarbers();
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get barber by ID with reviews (public)
router.get('/:id', (req, res) => {
  try {
    const barber = store.getBarberById(req.params.id);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }
    
    const reviews = store.getReviewsByBarberId(barber.id);
    res.json({ ...barber, reviews });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create barber (admin only)
router.post('/', adminMiddleware, (req, res) => {
  try {
    const { name, specialization, rating, experience, image, schedule } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const barber = store.createBarber({
      name,
      specialization: specialization || '',
      rating: parseFloat(rating) || 0,
      experience: parseInt(experience) || 0,
      image: image || '',
      schedule: schedule || {}
    });
    
    res.status(201).json(barber);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update barber (admin only)
router.put('/:id', adminMiddleware, (req, res) => {
  try {
    const barber = store.updateBarber(req.params.id, req.body);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }
    res.json(barber);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete barber (admin only)
router.delete('/:id', adminMiddleware, (req, res) => {
  try {
    const deleted = store.deleteBarber(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Barber not found' });
    }
    res.json({ message: 'Barber deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
