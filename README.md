# Barber Shop Full-Stack Application

## Overview

This is a complete full-stack web application for a barbershop, featuring:
- **Client-facing website** with services catalog, barber profiles, and online booking
- **Customer portal** for managing appointments
- **Admin dashboard** for business management
- **Barber interface** for schedule management
- **REST API** with JWT authentication

## Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend (Original)
- HTML5, CSS3, JavaScript
- Responsive design (mobile-first)

## Project Structure

```
/workspace
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth & validation middleware
│   │   ├── models/         # Data models (User, Service, Barber, Appointment, Review)
│   │   ├── routes/         # API routes
│   │   └── server.js       # Express server entry point
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/               # Frontend (to be developed)
├── img/                    # Images
├── index.html             # Main landing page
└── style.css              # Styles
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new client
- `POST /login` - Login user
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile

### Services (`/api/services`)
- `GET /` - Get all services (public)
- `GET /:id` - Get service by ID
- `POST /` - Create service (admin)
- `PUT /:id` - Update service (admin)
- `DELETE /:id` - Delete service (admin)

### Barbers (`/api/barbers`)
- `GET /` - Get all barbers (public)
- `GET /:id` - Get barber by ID with schedule
- `GET /:id/schedule` - Get barber schedule
- `PUT /:id/schedule` - Update schedule (admin/barber)
- `GET /:id/availability` - Check availability
- `POST /` - Create barber (admin)
- `PUT /:id` - Update barber (admin)
- `DELETE /:id` - Delete barber (admin)

### Appointments (`/api/appointments`)
- `POST /` - Book appointment (client)
- `GET /my` - Get client's appointments
- `GET /barber` - Get barber's appointments
- `GET /:id` - Get appointment details
- `PUT /:id/status` - Update status (admin/barber)
- `PUT /:id/cancel` - Cancel appointment (client)
- `PUT /:id/reschedule` - Reschedule (admin/barber)

### Reviews (`/api/reviews`)
- `POST /` - Create review (client, after completed appointment)
- `GET /barber/:barberId` - Get barber's approved reviews (public)
- `GET /` - Get all reviews (admin)
- `PUT /:id/approve` - Approve/reject review (admin)
- `DELETE /:id` - Delete review (admin)

### Admin (`/api/admin`)
- `GET /dashboard` - Dashboard statistics
- `GET /appointments` - All appointments with filters
- `GET /users` - All users
- `PUT /users/:id/status` - Block/unblock user
- `GET /export/appointments` - Export to CSV

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Database Setup

```bash
# Create database
createdb barbershop

# Run schema
psql -U postgres -d barbershop -f backend/src/config/schema.sql
```

Or using the npm script:
```bash
cd backend
npm run db:init
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and other settings

# Start development server
npm run dev

# Or start production server
npm start
```

### 3. Environment Variables

Edit `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=barbershop
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRE=7d

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# Optional: Email notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Optional: Telegram notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 4. Default Admin Account

After running the schema, you can login with:
- **Email:** admin@barbershop.com
- **Password:** admin123

**⚠️ Change this password immediately in production!**

## User Roles

### Client
- Browse services and barbers
- Book appointments
- View appointment history
- Cancel/reschedule appointments
- Leave reviews after completed visits

### Barber
- View own schedule
- See upcoming appointments
- Update appointment status
- Manage own working hours

### Admin
- Full access to all features
- Manage services, barbers, users
- View dashboard analytics
- Moderate reviews
- Export data

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based authorization
- ✅ Input validation on server side
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ XSS protection headers

## Testing

Test the API with these sample requests:

```bash
# Health check
curl http://localhost:5000/api/health

# Get services
curl http://localhost:5000/api/services

# Get barbers
curl http://localhost:5000/api/barbers

# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User","phone":"+1234567890"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Docker Deployment (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: barbershop
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backend/src/config/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
  
  api:
    build: ./backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: barbershop
      DB_USER: postgres
      DB_PASSWORD: postgres
    ports:
      - "5000:5000"
    depends_on:
      - postgres

volumes:
  pgdata:
```

Run with:
```bash
docker-compose up -d
```

## Next Steps

To complete the full-stack application:

1. **Frontend Development** (React/Next.js recommended):
   - Landing page integration
   - Booking flow UI
   - Customer dashboard
   - Admin panel

2. **Notifications**:
   - Email confirmation setup
   - Telegram bot integration
   - SMS reminders

3. **Additional Features**:
   - Payment integration
   - Multi-location support
   - Advanced analytics
   - Mobile app

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
