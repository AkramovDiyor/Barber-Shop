const pool = require('../config/database');

class ServiceModel {
  // Get all active services
  async getAllServices() {
    const query = `
      SELECT id, name, description, price, duration_minutes, image_url, is_active, created_at
      FROM services
      WHERE is_active = true
      ORDER BY name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get service by ID
  async getServiceById(id) {
    const query = 'SELECT * FROM services WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create new service
  async createService(serviceData) {
    const { name, description, price, duration_minutes, image_url } = serviceData;
    
    const query = `
      INSERT INTO services (name, description, price, duration_minutes, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [name, description || null, price, duration_minutes, image_url || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update service
  async updateService(id, serviceData) {
    const { name, description, price, duration_minutes, image_url, is_active } = serviceData;
    
    const query = `
      UPDATE services 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          duration_minutes = COALESCE($4, duration_minutes),
          image_url = COALESCE($5, image_url),
          is_active = COALESCE($6, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [name, description, price, duration_minutes, image_url, is_active, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete service (soft delete)
  async deleteService(id) {
    const query = `
      UPDATE services 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get services count
  async getServicesCount() {
    const query = 'SELECT COUNT(*) as count FROM services WHERE is_active = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = new ServiceModel();
