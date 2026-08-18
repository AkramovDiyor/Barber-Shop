const pool = require('../config/database');

class AppointmentModel {
  // Create new appointment
  async createAppointment(appointmentData) {
    const { client_id, barber_id, service_id, appointment_date, start_time, end_time, total_price, notes } = appointmentData;
    
    const query = `
      INSERT INTO appointments (client_id, barber_id, service_id, appointment_date, start_time, end_time, total_price, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [client_id, barber_id, service_id, appointment_date, start_time, end_time, total_price, notes || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get appointment by ID
  async getAppointmentById(id) {
    const query = `
      SELECT a.*, 
             c.full_name as client_name, c.email as client_email, c.phone as client_phone,
             b.full_name as barber_name,
             s.name as service_name, s.duration_minutes
      FROM appointments a
      JOIN users c ON a.client_id = c.id
      JOIN barbers br ON a.barber_id = br.id
      JOIN users b ON br.user_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get all appointments for a client
  async getClientAppointments(clientId, status = null) {
    let query = `
      SELECT a.*, 
             b.full_name as barber_name,
             s.name as service_name, s.duration_minutes, s.price
      FROM appointments a
      JOIN barbers br ON a.barber_id = br.id
      JOIN users b ON br.user_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE a.client_id = $1
    `;
    
    const values = [clientId];
    
    if (status) {
      query += ' AND a.status = $2';
      values.push(status);
    }
    
    query += ' ORDER BY a.appointment_date DESC, a.start_time DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get all appointments for a barber
  async getBarberAppointments(barberId, status = null, date = null) {
    let query = `
      SELECT a.*, 
             c.full_name as client_name, c.email as client_email, c.phone as client_phone,
             s.name as service_name, s.duration_minutes
      FROM appointments a
      JOIN users c ON a.client_id = c.id
      JOIN services s ON a.service_id = s.id
      WHERE a.barber_id = $1
    `;
    
    const values = [barberId];
    let paramIndex = 2;
    
    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }
    
    if (date) {
      query += ` AND a.appointment_date = $${paramIndex}`;
      values.push(date);
      paramIndex++;
    }
    
    query += ' ORDER BY a.appointment_date ASC, a.start_time ASC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get all appointments (admin)
  async getAllAppointments(status = null, startDate = null, endDate = null) {
    let query = `
      SELECT a.*, 
             c.full_name as client_name, c.email as client_email,
             b.full_name as barber_name,
             s.name as service_name
      FROM appointments a
      JOIN users c ON a.client_id = c.id
      JOIN barbers br ON a.barber_id = br.id
      JOIN users b ON br.user_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND a.appointment_date >= $${paramIndex}`;
      values.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND a.appointment_date <= $${paramIndex}`;
      values.push(endDate);
      paramIndex++;
    }
    
    query += ' ORDER BY a.appointment_date DESC, a.start_time DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update appointment status
  async updateAppointmentStatus(id, status, userId = null) {
    let query = `
      UPDATE appointments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    
    const values = [status, id];
    
    if (userId && status === 'cancelled') {
      query += ', cancelled_by = $2';
      values.splice(1, 0, userId);
    }
    
    query += ' WHERE id = $' + values.length + ' RETURNING *';
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Cancel appointment with reason
  async cancelAppointment(id, userId, reason) {
    const query = `
      UPDATE appointments 
      SET status = 'cancelled',
          cancelled_by = $2,
          cancellation_reason = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, userId, reason]);
    return result.rows[0];
  }

  // Reschedule appointment
  async rescheduleAppointment(id, newDate, newStartTime, newEndTime) {
    const query = `
      UPDATE appointments 
      SET appointment_date = $2,
          start_time = $3,
          end_time = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, newDate, newStartTime, newEndTime]);
    return result.rows[0];
  }

  // Mark appointment as completed
  async completeAppointment(id) {
    const query = `
      UPDATE appointments 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get appointments count
  async getAppointmentsCount(status = null) {
    let query = 'SELECT COUNT(*) as count FROM appointments';
    const values = [];
    
    if (status) {
      query += ' WHERE status = $1';
      values.push(status);
    }
    
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  // Get revenue statistics
  async getRevenueStats(startDate, endDate) {
    const query = `
      SELECT 
        COUNT(*) as total_appointments,
        SUM(total_price) FILTER (WHERE status = 'completed') as total_revenue,
        AVG(total_price) FILTER (WHERE status = 'completed') as avg_ticket
      FROM appointments
      WHERE appointment_date BETWEEN $1 AND $2
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows[0];
  }

  // Get top services
  async getTopServices(limit = 5) {
    const query = `
      SELECT s.name, s.id, COUNT(a.id) as bookings_count, SUM(a.total_price) as total_revenue
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.status = 'completed'
      GROUP BY s.id, s.name
      ORDER BY bookings_count DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Check time slot availability (for booking)
  async checkTimeSlotAvailability(barberId, date, startTime, endTime) {
    const conflictQuery = `
      SELECT COUNT(*) as count
      FROM appointments
      WHERE barber_id = $1
        AND appointment_date = $2
        AND status IN ('pending', 'confirmed')
        AND NOT (end_time <= $3 OR start_time >= $4)
    `;
    const result = await pool.query(conflictQuery, [barberId, date, startTime, endTime]);
    return parseInt(result.rows[0].count) === 0;
  }
}

module.exports = new AppointmentModel();
