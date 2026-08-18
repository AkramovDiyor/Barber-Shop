const pool = require('../config/database');

class UserService {
  // Create new user
  async createUser(userData) {
    const { email, password_hash, full_name, phone, role } = userData;
    
    const query = `
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, phone, role, is_active, created_at
    `;
    
    const values = [email, password_hash, full_name, phone || null, role || 'client'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find user by email
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  async findById(id) {
    const query = 'SELECT id, email, full_name, phone, role, is_active, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update user
  async updateUser(id, userData) {
    const { full_name, phone } = userData;
    
    const query = `
      UPDATE users 
      SET full_name = COALESCE($1, full_name), 
          phone = COALESCE($2, phone),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, email, full_name, phone, role, is_active, created_at
    `;
    
    const values = [full_name, phone, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all users (admin only)
  async getAllUsers(limit = 100, offset = 0) {
    const query = `
      SELECT id, email, full_name, phone, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Block/unblock user
  async toggleUserStatus(id, isActive) {
    const query = `
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, full_name, role, is_active
    `;
    const result = await pool.query(query, [isActive, id]);
    return result.rows[0];
  }

  // Delete user
  async deleteUser(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get user appointments count
  async getUserAppointmentsCount(userId) {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
      FROM appointments
      WHERE client_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = new UserService();
