import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    setFormData({ name: user?.name || '', phone: user?.phone || '' });
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/my');
      setAppointments(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/auth/me', formData);
      updateUser(response.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!confirm('Вы уверены, что хотите отменить запись?')) return;
    
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'upcoming') return ['pending', 'confirmed'].includes(apt.status);
    if (filter === 'past') return ['completed', 'cancelled'].includes(apt.status);
    return true;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Ожидает', class: 'status-pending' },
      confirmed: { text: 'Подтверждено', class: 'status-confirmed' },
      completed: { text: 'Завершено', class: 'status-completed' },
      cancelled: { text: 'Отменено', class: 'status-cancelled' }
    };
    const s = statusMap[status] || { text: status, class: '' };
    return <span className={`status-badge ${s.class}`}>{s.text}</span>;
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="profile-page">
      <div className="container">
        <h2>Личный кабинет</h2>
        
        <div className="profile-grid">
          <div className="profile-card">
            <h3>Мой профиль</h3>
            {editMode ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Имя</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleUpdateProfile}>Сохранить</button>
                  <button className="btn btn-outline" onClick={() => setEditMode(false)}>Отмена</button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <p><strong>Имя:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Телефон:</strong> {user?.phone || 'Не указан'}</p>
                <button className="btn btn-outline" onClick={() => setEditMode(true)}>Редактировать</button>
              </div>
            )}
          </div>

          <div className="appointments-card">
            <h3>Мои записи</h3>
            <div className="filter-tabs">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Все</button>
              <button className={filter === 'upcoming' ? 'active' : ''} onClick={() => setFilter('upcoming')}>Предстоящие</button>
              <button className={filter === 'past' ? 'active' : ''} onClick={() => setFilter('past')}>Прошедшие</button>
            </div>

            {filteredAppointments.length === 0 ? (
              <p className="no-appointments">У вас пока нет записей</p>
            ) : (
              <div className="appointments-list">
                {filteredAppointments.map(apt => (
                  <div key={apt.id} className="appointment-item">
                    <div className="apt-details">
                      <div className="apt-date">{apt.date} в {apt.time}</div>
                      <div className="apt-service">Услуга ID: {apt.serviceId}</div>
                      <div className="apt-barber">Барбер ID: {apt.barberId}</div>
                      <div className="apt-price">{apt.price} ₽</div>
                    </div>
                    <div className="apt-status">{getStatusBadge(apt.status)}</div>
                    {['pending', 'confirmed'].includes(apt.status) && (
                      <button className="btn btn-small btn-danger" onClick={() => handleCancelAppointment(apt.id)}>
                        Отменить
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
