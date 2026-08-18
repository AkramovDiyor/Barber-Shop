const express = require('express');
const router = express.Router();
const appointmentModel = require('../models/Appointment');
const serviceModel = require('../models/Service');
const barberModel = require('../models/Barber');
const userModel = require('../models/User');
const reviewModel = require('../models/Review');
const { authMiddleware, authorize } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30);
    
    // Get counts
    const totalAppointments = await appointmentModel.getAppointmentsCount();
    const pendingAppointments = await appointmentModel.getAppointmentsCount('pending');
    const confirmedAppointments = await appointmentModel.getAppointmentsCount('confirmed');
    const completedAppointments = await appointmentModel.getAppointmentsCount('completed');
    
    const servicesCount = await serviceModel.getServicesCount();
    const barbersCount = await barberModel.getBarbersCount();
    const reviewsCount = await reviewModel.getReviewsCount();
    const pendingReviews = await reviewModel.getReviewsCount(false);
    
    // Get revenue stats
    const revenueStats = await appointmentModel.getRevenueStats(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
    
    // Get top services
    const topServices = await appointmentModel.getTopServices(5);
    
    // Get all users count
    const allUsers = await userModel.getAllUsers(1, 0);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalAppointments,
          pendingAppointments,
          confirmedAppointments,
          completedAppointments,
          servicesCount,
          barbersCount,
          reviewsCount,
          pendingReviews
        },
        revenue: {
          totalRevenue: revenueStats.total_revenue || 0,
          totalAppointmentsInPeriod: revenueStats.total_appointments || 0,
          averageTicket: revenueStats.avg_ticket || 0
        },
        topServices
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/appointments
// @desc    Get all appointments with filters
// @access  Private/Admin
router.get('/appointments', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const appointments = await appointmentModel.getAllAppointments(status, startDate, endDate);
    
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

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { limit = 100, offset = 0, role } = req.query;
    
    // Note: In a real app, you'd add role filtering in the model
    const users = await userModel.getAllUsers(parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Block/unblock user
// @access  Private/Admin
router.put('/users/:id/status', authMiddleware, authorize('admin'), [
  require('express-validator').body('is_active').isBoolean(),
  require('../middleware/validator')
], async (req, res) => {
  try {
    const { is_active } = req.body;
    const user = await userModel.toggleUserStatus(req.params.id, is_active);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'blocked'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/export/appointments
// @desc    Export appointments to CSV
// @access  Private/Admin
router.get('/export/appointments', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const appointments = await appointmentModel.getAllAppointments(null, startDate, endDate);
    
    // Convert to CSV format
    const csvRows = [];
    csvRows.push(['ID', 'Client', 'Barber', 'Service', 'Date', 'Time', 'Status', 'Price']);
    
    appointments.forEach(apt => {
      csvRows.push([
        apt.id,
        apt.client_name,
        apt.barber_name,
        apt.service_name,
        apt.appointment_date,
        apt.start_time,
        apt.status,
        apt.total_price
      ]);
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=appointments.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
