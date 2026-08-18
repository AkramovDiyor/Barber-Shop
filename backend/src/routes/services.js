const express = require('express');
const router = express.Router();
const serviceModel = require('../models/Service');
const { authMiddleware, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validator');

// @route   GET /api/services
// @desc    Get all active services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await serviceModel.getAllServices();
    
    res.json({
      success: true,
      count: services.length,
      data: { services }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/services/:id
// @desc    Get service by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await serviceModel.getServiceById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      data: { service }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/services
// @desc    Create new service
// @access  Private/Admin only
router.post('/', authMiddleware, authorize('admin'), [
  body('name').notEmpty().withMessage('Service name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration_minutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  validateRequest
], async (req, res) => {
  try {
    const service = await serviceModel.createService(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Private/Admin only
router.put('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const service = await serviceModel.updateService(req.params.id, req.body);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete service (soft delete)
// @access  Private/Admin only
router.delete('/:id', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const result = await serviceModel.deleteService(req.params.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
