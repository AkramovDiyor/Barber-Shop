import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, appointmentsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/appointments')
      ]);
      setStats(statsRes.data);
      setAppointments(appointmentsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleExport = async (type) => {
    window.open(`/api/admin/export/${type}`, '_blank');
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h2>Админ-панель</h2>
        
        <div className="admin-tabs">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            Дашборд
          </button>
          <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>
            Записи ({appointments.length})
          </button>
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.totalAppointments}</h3>
                <p>Всего записей</p>
              </div>
              <div className="stat-card">
                <h3>{stats.pendingAppointments}</h3>
                <p>Ожидают подтверждения</p>
              </div>
              <div className="stat-card">
                <h3>{stats.confirmedAppointments}</h3>
                <p>Подтверждено</p>
              </div>
              <div className="stat-card">
                <h3>{stats.cancelledAppointments}</h3>
                <p>Отменено</p>
              </div>
              <div className="stat-card highlight">
                <h3>{stats.totalRevenue} ₽</h3>
                <p>Выручка</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalClients}</h3>
                <p>Клиентов</p>
              </div>
            </div>

            <div className="export-section">
              <h3>Экспорт данных</h3>
              <button className="btn btn-outline" onClick={() => handleExport('appointments')}>
                Экспорт записей (CSV)
              </button>
              <button className="btn btn-outline" onClick={() => handleExport('users')}>
                Экспорт пользователей (CSV)
              </button>
            </div>

            <div className="barber-stats">
              <h3>Статистика по барберам</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Барбер</th>
                    <th>Записей</th>
                    <th>Выручка</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.barberStats.map(bs => (
                    <tr key={bs.barberId}>
                      <td>{bs.barberName}</td>
                      <td>{bs.appointmentsCount}</td>
                      <td>{bs.revenue} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="service-stats">
              <h3>Популярные услуги</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Услуга</th>
                    <th>Количество записей</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.serviceStats.slice(0, 5).map(ss => (
                    <tr key={ss.serviceId}>
                      <td>{ss.serviceName}</td>
                      <td>{ss.bookingsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-content">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Клиент</th>
                  <th>Услуга</th>
                  <th>Барбер</th>
                  <th>Дата/Время</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.id}>
                    <td>{apt.id.slice(-6)}</td>
                    <td>
                      {apt.clientName}<br/>
                      <small>{apt.clientPhone}</small>
                    </td>
                    <td>{apt.serviceId}</td>
                    <td>{apt.barberId}</td>
                    <td>{apt.date} {apt.time}</td>
                    <td>{apt.price} ₽</td>
                    <td>
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Ожидает</option>
                        <option value="confirmed">Подтверждено</option>
                        <option value="completed">Завершено</option>
                        <option value="cancelled">Отменено</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-small" onClick={() => window.open(`/profile`, '_blank')}>
                        Просмотр
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
