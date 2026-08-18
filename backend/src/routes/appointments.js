const express = require('express');
const router = express.Router();
const appointmentModel = require('../models/Appointment');
const barberModel = require('../models/Barber');
const serviceModel = require('../models/Service');
const { authMiddleware, authorize } = require('../middleware/auth');
const { body, query } = require('express-validator');
const validateRequest = require('../middleware/validator');

// Helper function to calculate end time based on service duration
const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes + durationMinutes, 0, 0);
  
  const endHours = String(startDate.getHours()).padStart(2, '0');
  const endMinutes = String(startDate.getMinutes()).padStart(2, '0');
  
  return `${endHours}:${endMinutes}`;
};

// @route   POST /api/appointments
// @desc    Create new appointment (booking)
// @access  Private/Client
router.post('/', authMiddleware, authorize('client'), [
  body('barber_id').isInt().withMessage('Valid barber ID is required'),
  body('service_id').isInt().withMessage('Valid service ID is required'),
  body('appointment_date').isISO8601().withMessage('Valid date is required'),
  body('start_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid start time is required (HH:MM)'),
  body('notes').optional(),
  validateRequest
], async (req, res) => {
  try {
    const { barber_id, service_id, appointment_date, start_time, notes } = req.body;
    
    // Get service details
    const service = await serviceModel.getServiceById(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Calculate end time
    const end_time = calculateEndTime(start_time, service.duration_minutes);
    
    // Check barber availability
    const isAvailable = await barberModel.isBarberAvailable(barber_id, appointment_date, start_time, end_time);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is not available. Please choose another time.'
      });
    }
    
    // Create appointment
    const appointment = await appointmentModel.createAppointment({
      client_id: req.user.id,
      barber_id,
      service_id,
      appointment_date,
      start_time,
      end_time,
      total_price: service.price,
      notes
    });
    
    // TODO: Send confirmation notification (email/Telegram)
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/my
// @desc    Get current user's appointments
// @access  Private/Client
router.get('/my', authMiddleware, authorize('client'), async (req, res) => {
  try {
    const { status } = req.query;
    const appointments = await appointmentModel.getClientAppointments(req.user.id, status);
    
    res.json({
      success: true,
      count: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/barber
// @desc    Get barber's appointments
// @access  Private/Barber or Admin
router.get('/barber', authMiddleware, authorize('barber', 'admin'), async (req, res) => {
  try {
    const { status, date } = req.query;
    
    let barberId;
    if (req.user.role === 'admin') {
      barberId = req.query.barber_id;
      if (!barberId) {
        return res.status(400).json({
          success: false,
          message: 'barber_id is required for admin users'
        });
      }
    } else {
      // Get barber ID from user
      const barber = await barberModel.getBarberByUserId(req.user.id);
      if (!barber) {
        return res.status(404).json({
          success: false,
          message: 'Barber profile not found'
        });
      }
      barberId = barber.id;
    }
    
    const appointments = await appointmentModel.getBarberAppointments(barberId, status, date);
    
    res.json({
      success: true,
      count: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    console.error('Get barber appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await appointmentModel.getAppointmentById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check authorization
    const isAuthorized = 
      req.user.role === 'admin' ||
      appointment.client_id === req.user.id ||
      appointment.barber_id === req.user.id;
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }
    
    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private/Admin or Barber
router.put('/:id/status', authMiddleware, authorize('admin', 'barber'), [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).withMessage('Invalid status'),
  validateRequest
], async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await appointmentModel.getAppointmentById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check authorization
    if (req.user.role === 'barber' && appointment.barber_id !== req.user.barber_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }
    
    const updatedAppointment = await appointmentModel.updateAppointmentStatus(req.params.id, status, req.user.id);
    
    res.json({
      success: true,
      message: 'Appointment status updated',
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private/Client
router.put('/:id/cancel', authMiddleware, authorize('client'), [
  body('reason').optional(),
  validateRequest
], async (req, res) => {
  try {
    const appointment = await appointmentModel.getAppointmentById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user owns the appointment
    if (appointment.client_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }
    
    // Check if appointment can be cancelled
    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'This appointment cannot be cancelled'
      });
    }
    
    const { reason } = req.body;
    const updatedAppointment = await appointmentModel.cancelAppointment(req.params.id, req.user.id, reason || null);
    
    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/appointments/:id/reschedule
// @desc    Reschedule appointment
// @access  Private/Admin or Barber
router.put('/:id/reschedule', authMiddleware, authorize('admin', 'barber'), [
  body('appointment_date').isISO8601().withMessage('Valid date is required'),
  body('start_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid start time is required (HH:MM)'),
  validateRequest
], async (req, res) => {
  try {
    const { appointment_date, start_time } = req.body;
    const appointment = await appointmentModel.getAppointmentById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Get service duration
    const service = await serviceModel.getServiceById(appointment.service_id);
    const end_time = calculateEndTime(start_time, service.duration_minutes);
    
    // Check availability
    const isAvailable = await barberModel.isBarberAvailable(appointment.barber_id, appointment_date, start_time, end_time);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is not available'
      });
    }
    
    const updatedAppointment = await appointmentModel.rescheduleAppointment(
      req.params.id, 
      appointment_date, 
      start_time, 
      end_time
    );
    
    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
