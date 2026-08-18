const express = require('express');
const { adminMiddleware } = require('../middleware/auth');
const store = require('../data/store');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', adminMiddleware, (req, res) => {
  try {
    const stats = store.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Export appointments as CSV
router.get('/export/appointments', adminMiddleware, (req, res) => {
  try {
    const appointments = store.getAllAppointments();
    
    const csvHeader = 'ID,Client Name,Client Email,Client Phone,Service,Barber,Date,Time,Duration,Price,Status,Created At\n';
    const csvRows = appointments.map(a => 
      `"${a.id}","${a.clientName}","${a.clientEmail}","${a.clientPhone}","${a.serviceId}","${a.barberId}","${a.date}","${a.time}",${a.duration},${a.price},"${a.status}","${a.createdAt}"`
    ).join('\n');
    
    const csv = csvHeader + csvRows;
    
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="appointments.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Export users as CSV
router.get('/export/users', adminMiddleware, (req, res) => {
  try {
    const users = store.getAllUsers();
    
    const csvHeader = 'ID,Name,Email,Phone,Role,Created At\n';
    const csvRows = users.map(u => 
      `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.role}","${u.createdAt}"`
    ).join('\n');
    
    const csv = csvHeader + csvRows;
    
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', adminMiddleware, (req, res) => {
  try {
    const users = store.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role or block (admin only)
router.patch('/users/:id', adminMiddleware, (req, res) => {
  try {
    const { role, blocked } = req.body;
    const updates = {};
    
    if (role && ['client', 'barber', 'admin'].includes(role)) {
      updates.role = role;
    }
    if (blocked !== undefined) {
      updates.blocked = !!blocked;
    }
    
    const user = store.updateUser(req.params.id, updates);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
