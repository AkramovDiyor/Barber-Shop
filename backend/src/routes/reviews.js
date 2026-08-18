const express = require('express');
const router = express.Router();
const reviewModel = require('../models/Review');
const appointmentModel = require('../models/Appointment');
const { authMiddleware, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validator');

// @route   POST /api/reviews
// @desc    Create new review (after completed appointment)
// @access  Private/Client
router.post('/', authMiddleware, authorize('client'), [
  body('barber_id').isInt().withMessage('Valid barber ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('appointment_id').optional().isInt(),
  body('comment').optional(),
  validateRequest
], async (req, res) => {
  try {
    const { barber_id, rating, appointment_id, comment } = req.body;
    
    // If appointment_id provided, verify it belongs to the client and is completed
    if (appointment_id) {
      const appointment = await appointmentModel.getAppointmentById(appointment_id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      if (appointment.client_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to review this appointment'
        });
      }
      
      if (appointment.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Can only review completed appointments'
        });
      }
      
      // Check if already reviewed
      const hasReviewed = await reviewModel.hasReviewedAppointment(appointment_id, req.user.id);
      if (hasReviewed) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this appointment'
        });
      }
    }
    
    // Create review
    const review = await reviewModel.createReview({
      appointment_id: appointment_id || null,
      client_id: req.user.id,
      barber_id,
      rating,
      comment
    });
    
    // Recalculate barber rating
    await reviewModel.recalculateBarberRating(barber_id);
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be visible after moderation.',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reviews/barber/:barberId
// @desc    Get approved reviews for a barber
// @access  Public
router.get('/barber/:barberId', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const reviews = await reviewModel.getBarberReviews(
      req.params.barberId, 
      true, // Only approved reviews
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      success: true,
      count: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    console.error('Get barber reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reviews
// @desc    Get all reviews (admin only)
// @access  Private/Admin
router.get('/', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { is_approved, limit = 100, offset = 0 } = req.query;
    
    const reviews = await reviewModel.getAllReviews(
      is_approved !== undefined ? is_approved === 'true' : null,
      parseInt(limit),
      parseInt(offset)
    );
    
    const count = await reviewModel.getReviewsCount(
      is_approved !== undefined ? is_approved === 'true' : null
    );
    
    res.json({
      success: true,
      count,
      data: { reviews }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/reviews/:id/approve
// @desc    Approve/reject review
// @access  Private/Admin
router.put('/:id/approve', authMiddleware, authorize('admin'), [
  body('is_approved').isBoolean().withMessage('is_approved must be a boolean'),
  validateRequest
], async (req, res) => {
  try {
    const { is_approved } = req.body;
    const review = await reviewModel.updateReviewApproval(req.params.id, is_approved);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Recalculate barber rating if review was approved
    if (is_approved) {
      await reviewModel.recalculateBarberRating(review.barber_id);
    }
    
    res.json({
      success: true,
      message: `Review ${is_approved ? 'approved' : 'rejected'} successfully`,
      data: { review }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private/Admin
router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const review = await reviewModel.getReviewById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    await reviewModel.deleteReview(req.params.id);
    
    // Recalculate barber rating
    await reviewModel.recalculateBarberRating(review.barber_id);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
