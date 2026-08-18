const express = require('express');
const router = express.Router();
const barberModel = require('../models/Barber');
const userModel = require('../models/User');
const { authMiddleware, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validator');

// @route   GET /api/barbers
// @desc    Get all active barbers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const barbers = await barberModel.getAllBarbers();
    
    res.json({
      success: true,
      count: barbers.length,
      data: { barbers }
    });
  } catch (error) {
    console.error('Get barbers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/barbers/:id
// @desc    Get barber by ID with schedule
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const barber = await barberModel.getBarberById(req.params.id);
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }
    
    // Get barber's schedule
    const schedule = await barberModel.getBarberSchedule(barber.id);
    
    res.json({
      success: true,
      data: { 
        barber,
        schedule
      }
    });
  } catch (error) {
    console.error('Get barber error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/barbers
// @desc    Create new barber (admin only)
// @access  Private/Admin
router.post('/', authMiddleware, authorize('admin'), [
  body('user_id').isInt().withMessage('Valid user ID is required'),
  body('specialization').optional(),
  body('bio').optional(),
  validateRequest
], async (req, res) => {
  try {
    const barber = await barberModel.createBarber(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Barber created successfully',
      data: { barber }
    });
  } catch (error) {
    console.error('Create barber error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/barbers/:id
// @desc    Update barber
// @access  Private/Admin
router.put('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const barber = await barberModel.updateBarber(req.params.id, req.body);
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Barber updated successfully',
      data: { barber }
    });
  } catch (error) {
    console.error('Update barber error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/barbers/:id
// @desc    Delete barber (soft delete)
// @access  Private/Admin
router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const result = await barberModel.deleteBarber(req.params.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Barber deleted successfully'
    });
  } catch (error) {
    console.error('Delete barber error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/barbers/:id/schedule
// @desc    Get barber's schedule
// @access  Public
router.get('/:id/schedule', async (req, res) => {
  try {
    const schedule = await barberModel.getBarberSchedule(req.params.id);
    
    res.json({
      success: true,
      data: { schedule }
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/barbers/:id/schedule
// @desc    Set barber's schedule for a day
// @access  Private/Admin or Barber (own schedule)
router.put('/:id/schedule', authMiddleware, async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, is_day_off } = req.body;
    
    // Check authorization
    const barber = await barberModel.getBarberById(req.params.id);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }
    
    // Only admin or the barber themselves can update schedule
    if (req.user.role !== 'admin' && barber.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
    }
    
    const schedule = await barberModel.setBarberSchedule(
      req.params.id, 
      day_of_week, 
      start_time, 
      end_time, 
      is_day_off
    );
    
    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: { schedule }
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/barbers/:id/availability
// @desc    Check barber availability for a specific date and time
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { date, start_time, end_time } = req.query;
    
    if (!date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Date, start_time, and end_time are required'
      });
    }
    
    const isAvailable = await barberModel.isBarberAvailable(
      req.params.id, 
      date, 
      start_time, 
      end_time
    );
    
    res.json({
      success: true,
      data: { 
        isAvailable,
        barberId: req.params.id,
        date,
        startTime: start_time,
        endTime: end_time
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/barbers/me
// @desc    Get current logged-in barber's profile
// @access  Private/Barber
router.get('/me', authMiddleware, authorize('barber'), async (req, res) => {
  try {
    const barber = await barberModel.getBarberByUserId(req.user.id);
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber profile not found'
      });
    }
    
    const schedule = await barberModel.getBarberSchedule(barber.id);
    
    res.json({
      success: true,
      data: { barber, schedule }
    });
  } catch (error) {
    console.error('Get barber profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
