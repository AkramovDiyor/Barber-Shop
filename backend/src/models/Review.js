const pool = require('../config/database');

class ReviewModel {
  // Create new review
  async createReview(reviewData) {
    const { appointment_id, client_id, barber_id, rating, comment } = reviewData;
    
    const query = `
      INSERT INTO reviews (appointment_id, client_id, barber_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [appointment_id || null, client_id, barber_id, rating, comment || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all reviews for a barber
  async getBarberReviews(barberId, isApproved = null, limit = 100, offset = 0) {
    let query = `
      SELECT r.*, c.full_name as client_name
      FROM reviews r
      JOIN users c ON r.client_id = c.id
      WHERE r.barber_id = $1
    `;
    
    const values = [barberId];
    
    if (isApproved !== null) {
      query += ' AND r.is_approved = $2';
      values.push(isApproved);
    }
    
    query += ' ORDER BY r.created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(limit, offset);
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get all reviews (admin)
  async getAllReviews(isApproved = null, limit = 100, offset = 0) {
    let query = `
      SELECT r.*, 
             c.full_name as client_name,
             b.full_name as barber_name
      FROM reviews r
      JOIN users c ON r.client_id = c.id
      JOIN barbers br ON r.barber_id = br.id
      JOIN users b ON br.user_id = b.id
      WHERE 1=1
    `;
    
    const values = [];
    
    if (isApproved !== null) {
      query += ' AND r.is_approved = $1';
      values.push(isApproved);
    }
    
    query += ' ORDER BY r.created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(limit, offset);
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get review by ID
  async getReviewById(id) {
    const query = `
      SELECT r.*, c.full_name as client_name, b.full_name as barber_name
      FROM reviews r
      JOIN users c ON r.client_id = c.id
      JOIN barbers br ON r.barber_id = br.id
      JOIN users b ON br.user_id = b.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Approve/reject review
  async updateReviewApproval(id, isApproved) {
    const query = `
      UPDATE reviews 
      SET is_approved = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [isApproved, id]);
    return result.rows[0];
  }

  // Delete review
  async deleteReview(id) {
    const query = 'DELETE FROM reviews WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update barber rating based on reviews
  async recalculateBarberRating(barberId) {
    const query = `
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE barber_id = $1 AND is_approved = true
    `;
    const result = await pool.query(query, [barberId]);
    
    if (result.rows[0].total_reviews > 0) {
      const { avg_rating, total_reviews } = result.rows[0];
      
      const updateQuery = `
        UPDATE barbers 
        SET rating = $1, total_reviews = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, rating, total_reviews
      `;
      const updateResult = await pool.query(updateQuery, [avg_rating, total_reviews, barberId]);
      return updateResult.rows[0];
    }
    
    return null;
  }

  // Get reviews count
  async getReviewsCount(isApproved = null) {
    let query = 'SELECT COUNT(*) as count FROM reviews';
    const values = [];
    
    if (isApproved !== null) {
      query += ' WHERE is_approved = $1';
      values.push(isApproved);
    }
    
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  // Check if client already reviewed an appointment
  async hasReviewedAppointment(appointmentId, clientId) {
    const query = `
      SELECT COUNT(*) as count
      FROM reviews
      WHERE appointment_id = $1 AND client_id = $2
    `;
    const result = await pool.query(query, [appointmentId, clientId]);
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = new ReviewModel();
