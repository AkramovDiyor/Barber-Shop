const pool = require('../config/database');

class BarberModel {
  // Get all active barbers with their ratings
  async getAllBarbers() {
    const query = `
      SELECT b.id, b.user_id, b.specialization, b.bio, b.rating, b.total_reviews, 
             b.image_url, b.is_active, u.full_name, u.email, u.phone
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.is_active = true AND u.is_active = true
      ORDER BY b.rating DESC, b.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get barber by ID
  async getBarberById(id) {
    const query = `
      SELECT b.*, u.full_name, u.email, u.phone
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get barber by user ID
  async getBarberByUserId(userId) {
    const query = `
      SELECT b.*, u.full_name, u.email, u.phone
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Create new barber
  async createBarber(barberData) {
    const { user_id, specialization, bio, image_url } = barberData;
    
    const query = `
      INSERT INTO barbers (user_id, specialization, bio, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [user_id, specialization || null, bio || null, image_url || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update barber
  async updateBarber(id, barberData) {
    const { specialization, bio, image_url, is_active } = barberData;
    
    const query = `
      UPDATE barbers 
      SET specialization = COALESCE($1, specialization),
          bio = COALESCE($2, bio),
          image_url = COALESCE($3, image_url),
          is_active = COALESCE($4, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    
    const values = [specialization, bio, image_url, is_active, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update barber rating
  async updateBarberRating(barberId, rating, totalReviews) {
    const query = `
      UPDATE barbers 
      SET rating = $1, total_reviews = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, rating, total_reviews
    `;
    const result = await pool.query(query, [rating, totalReviews, barberId]);
    return result.rows[0];
  }

  // Delete barber (soft delete)
  async deleteBarber(id) {
    const query = `
      UPDATE barbers 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get barber's schedule
  async getBarberSchedule(barberId) {
    const query = `
      SELECT id, day_of_week, start_time, end_time, is_day_off
      FROM barber_schedules
      WHERE barber_id = $1
      ORDER BY day_of_week
    `;
    const result = await pool.query(query, [barberId]);
    return result.rows;
  }

  // Set/update barber schedule for a day
  async setBarberSchedule(barberId, dayOfWeek, startTime, endTime, isDayOff = false) {
    const query = `
      INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time, is_day_off)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (barber_id, day_of_week) 
      DO UPDATE SET start_time = $3, end_time = $4, is_day_off = $5, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [barberId, dayOfWeek, startTime, endTime, isDayOff];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Check if barber is available at specific time
  async isBarberAvailable(barberId, date, startTime, endTime) {
    const dayOfWeek = new Date(date).getDay();
    
    // Check if barber works on that day
    const scheduleQuery = `
      SELECT start_time, end_time, is_day_off
      FROM barber_schedules
      WHERE barber_id = $1 AND day_of_week = $2
    `;
    const scheduleResult = await pool.query(scheduleQuery, [barberId, dayOfWeek]);
    
    if (scheduleResult.rows.length === 0 || scheduleResult.rows[0].is_day_off) {
      return false; // Barber doesn't work on this day
    }

    const workStart = scheduleResult.rows[0].start_time;
    const workEnd = scheduleResult.rows[0].end_time;

    // Check if requested time is within working hours
    if (startTime < workStart || endTime > workEnd) {
      return false;
    }

    // Check for existing appointments
    const conflictQuery = `
      SELECT COUNT(*) as count
      FROM appointments
      WHERE barber_id = $1
        AND appointment_date = $2
        AND status IN ('pending', 'confirmed')
        AND NOT (end_time <= $3 OR start_time >= $4)
    `;
    const conflictResult = await pool.query(conflictQuery, [barberId, date, startTime, endTime]);
    
    return parseInt(conflictResult.rows[0].count) === 0;
  }

  // Get barbers count
  async getBarbersCount() {
    const query = 'SELECT COUNT(*) as count FROM barbers WHERE is_active = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = new BarberModel();
