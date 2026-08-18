const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const store = require('../data/store');

const router = express.Router();

// Get all services (public)
router.get('/', (req, res) => {
  try {
    const services = store.getAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get service by ID (public)
router.get('/:id', (req, res) => {
  try {
    const service = store.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create service (admin only)
router.post('/', adminMiddleware, (req, res) => {
  try {
    const { name, description, price, duration, image } = req.body;
    
    if (!name || !price || !duration) {
      return res.status(400).json({ error: 'Name, price and duration are required' });
    }

    const service = store.createService({
      name,
      description: description || '',
      price: parseFloat(price),
      duration: parseInt(duration),
      image: image || ''
    });
    
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update service (admin only)
router.put('/:id', adminMiddleware, (req, res) => {
  try {
    const service = store.updateService(req.params.id, req.body);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete service (admin only)
router.delete('/:id', adminMiddleware, (req, res) => {
  try {
    const deleted = store.deleteService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
