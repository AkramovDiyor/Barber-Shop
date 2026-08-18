import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getMyAppointments(
        filter === 'all' ? null : filter
      );
      if (response.success) {
        setAppointments(response.data.appointments);
      }
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await appointmentService.cancel(id, 'Cancelled by client');
      if (response.success) {
        loadAppointments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge ${status}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p><strong>Name:</strong> {user.full_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
          <p><strong>Role:</strong> {user.role}</p>
          <button className="btn-secondary" onClick={logout} style={{ marginTop: '15px' }}>
            Logout
          </button>
        </div>

        <div className="profile-section">
          <h2>My Appointments</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div style={{ marginBottom: '20px' }}>
            <button 
              className={`btn-small ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setFilter('all'); loadAppointments(); }}
              style={{ marginRight: '10px' }}
            >
              All
            </button>
            <button 
              className={`btn-small ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setFilter('pending'); loadAppointments(); }}
              style={{ marginRight: '10px' }}
            >
              Pending
            </button>
            <button 
              className={`btn-small ${filter === 'confirmed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setFilter('confirmed'); loadAppointments(); }}
              style={{ marginRight: '10px' }}
            >
              Confirmed
            </button>
            <button 
              className={`btn-small ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setFilter('completed'); loadAppointments(); }}
            >
              Completed
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : appointments.length > 0 ? (
            appointments.map(apt => (
              <div key={apt.id} className={`appointment-card ${apt.status}`}>
                <div className="appointment-header">
                  <h3>{apt.service_name}</h3>
                  <span className={getStatusBadgeClass(apt.status)}>
                    {apt.status}
                  </span>
                </div>
                <p><strong>Barber:</strong> {apt.barber_name}</p>
                <p><strong>Date:</strong> {formatDate(apt.appointment_date)}</p>
                <p><strong>Time:</strong> {apt.start_time}</p>
                <p><strong>Price:</strong> ${apt.total_price}</p>
                {apt.notes && <p><strong>Notes:</strong> {apt.notes}</p>}
                
                {apt.status === 'pending' && (
                  <button 
                    className="btn-small btn-danger"
                    onClick={() => handleCancel(apt.id)}
                    style={{ marginTop: '10px' }}
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No appointments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
