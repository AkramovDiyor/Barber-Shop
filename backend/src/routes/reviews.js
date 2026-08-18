const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const store = require('../data/store');

const router = express.Router();

// Get all approved reviews (public)
router.get('/', (req, res) => {
  try {
    const status = req.query.status || 'approved';
    const reviews = store.getAllReviews(status);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reviews for specific barber (public)
router.get('/barber/:barberId', (req, res) => {
  try {
    const reviews = store.getReviewsByBarberId(req.params.barberId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create review (authenticated users)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { barberId, rating, comment } = req.body;
    
    if (!barberId || !rating) {
      return res.status(400).json({ error: 'Barber ID and rating are required' });
    }

    const barber = store.getBarberById(barberId);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    const review = store.createReview({
      userId: req.user.id,
      userName: req.user.name,
      barberId,
      barberName: barber.name,
      rating: parseInt(rating),
      comment: comment || ''
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update review status (admin only - for moderation)
router.patch('/:id/status', adminMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const review = store.updateReview(req.params.id, { status });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete review (admin only)
router.delete('/:id', adminMiddleware, (req, res) => {
  try {
    const deleted = store.deleteReview(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
