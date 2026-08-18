import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/appointments');
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export/appointments', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'appointments.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US');
  };

  if (loading && !dashboardData) {
    return (
      <div className="booking-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h1>Admin Dashboard</h1>
        
        {error && <div className="error-message">{error}</div>}

        <div className="admin-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => { setActiveTab('overview'); loadDashboard(); }}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'appointments' ? 'active' : ''}
            onClick={() => { setActiveTab('appointments'); loadAppointments(); }}
          >
            Appointments
          </button>
          <button onClick={handleExport}>
            Export CSV
          </button>
        </div>

        {activeTab === 'overview' && dashboardData && (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Total Appointments</h3>
                <div className="value">{dashboardData.overview.totalAppointments}</div>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <div className="value">{dashboardData.overview.pendingAppointments}</div>
              </div>
              <div className="stat-card">
                <h3>Confirmed</h3>
                <div className="value">{dashboardData.overview.confirmedAppointments}</div>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <div className="value">{dashboardData.overview.completedAppointments}</div>
              </div>
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <div className="value">${dashboardData.revenue.totalRevenue}</div>
              </div>
              <div className="stat-card">
                <h3>Avg Ticket</h3>
                <div className="value">${dashboardData.revenue.averageTicket}</div>
              </div>
              <div className="stat-card">
                <h3>Services</h3>
                <div className="value">{dashboardData.overview.servicesCount}</div>
              </div>
              <div className="stat-card">
                <h3>Barbers</h3>
                <div className="value">{dashboardData.overview.barbersCount}</div>
              </div>
              <div className="stat-card">
                <h3>Pending Reviews</h3>
                <div className="value">{dashboardData.overview.pendingReviews}</div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Top Services</h2>
              {dashboardData.topServices && dashboardData.topServices.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.topServices.map(service => (
                      <tr key={service.service_id}>
                        <td>{service.service_name}</td>
                        <td>{service.bookings_count}</td>
                        <td>${service.total_revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No service data available</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'appointments' && (
          <div className="profile-section">
            <h2>All Appointments</h2>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : appointments.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Barber</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.id}</td>
                      <td>{apt.client_name}</td>
                      <td>{apt.barber_name}</td>
                      <td>{apt.service_name}</td>
                      <td>{formatDate(apt.appointment_date)}</td>
                      <td>{apt.start_time}</td>
                      <td>
                        <span className={`status-badge ${apt.status}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>${apt.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No appointments found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
