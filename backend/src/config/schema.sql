-- Database schema for Barber Shop Application

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS barber_schedules CASCADE;
DROP TABLE IF EXISTS barbers CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (clients, admins, barbers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'barber', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Barbers table (extends users with barber-specific info)
CREATE TABLE barbers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255),
    bio TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Barber schedules (working hours and days off)
CREATE TABLE barber_schedules (
    id SERIAL PRIMARY KEY,
    barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_day_off BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(barber_id, day_of_week)
);

-- Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    cancelled_by INTEGER REFERENCES users(id),
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_barber_id ON appointments(barber_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_barbers_user_id ON barbers(user_id);
CREATE INDEX idx_reviews_barber_id ON reviews(barber_id);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('admin@barbershop.com', '$2a$10$KIXxJk7zK9lqQVZvL8h5Ye.4xGZ5vK9lqQVZvL8h5Ye.4xGZ5vK9l', 'Admin User', 'admin');

-- Insert sample services
INSERT INTO services (name, description, price, duration_minutes, image_url) VALUES
('Hair Styling', 'Professional hair styling with premium products', 25.00, 45, '/img/pic-1.jpeg'),
('Beard Trim', 'Precision beard trimming and shaping', 15.00, 30, '/img/pic-2.jpeg'),
('Hair Cut', 'Classic or modern haircut', 20.00, 40, '/img/pic-3.jpeg'),
('Dry Shampoo', 'Hair cleaning without water', 10.00, 20, '/img/pic-4.jpeg');
