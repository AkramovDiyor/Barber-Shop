import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [formData, setFormData] = useState({
    serviceId: '',
    barberId: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    notes: ''
  });
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, barbersRes] = await Promise.all([
          api.get('/services'),
          api.get('/barbers')
        ]);
        setServices(servicesRes.data);
        setBarbers(barbersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData({ ...formData, serviceId: service.id });
  };

  const handleBarberSelect = (barber) => {
    setSelectedBarber(barber);
    setFormData({ ...formData, barberId: barber.id });
  };

  const checkAvailability = async () => {
    if (!formData.date || !selectedBarber) return;
    
    try {
      // Generate time slots based on barber schedule and service duration
      const times = [];
      const startHour = 10;
      const endHour = 22;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let min of ['00', '30']) {
          const time = `${hour.toString().padStart(2, '0')}:${min}`;
          
          const response = await api.post('/appointments/check-availability', {
            barberId: selectedBarber.id,
            date: formData.date,
            time,
            duration: selectedService.duration
          });
          
          if (response.data.available) {
            times.push(time);
          }
        }
      }
      setAvailableTimes(times);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  useEffect(() => {
    if (formData.date && selectedBarber && selectedService) {
      checkAvailability();
    }
  }, [formData.date]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/appointments', {
        serviceId: formData.serviceId,
        barberId: formData.barberId,
        date: formData.date,
        time: formData.time,
        name: formData.name,
        phone: formData.phone,
        notes: formData.notes
      });
      setStep(5); // Success step
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании записи');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="booking-step">
      <h3>Выберите услугу</h3>
      <div className="services-list">
        {services.map(service => (
          <div
            key={service.id}
            className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
            onClick={() => handleServiceSelect(service)}
          >
            <div className="service-option-info">
              <h4>{service.name}</h4>
              <p>{service.description}</p>
              <span className="duration">⏱️ {service.duration} мин</span>
            </div>
            <span className="price">{service.price} ₽</span>
          </div>
        ))}
      </div>
      <button
        className="btn btn-primary"
        disabled={!selectedService}
        onClick={() => setStep(2)}
      >
        Далее
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="booking-step">
      <h3>Выберите барбера</h3>
      <div className="barbers-list">
        {barbers.map(barber => (
          <div
            key={barber.id}
            className={`barber-option ${selectedBarber?.id === barber.id ? 'selected' : ''}`}
            onClick={() => handleBarberSelect(barber)}
          >
            <div className="barber-option-avatar">👨‍🦱</div>
            <div className="barber-option-info">
              <h4>{barber.name}</h4>
              <p>{barber.specialization}</p>
              <span className="rating">⭐ {barber.rating}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="booking-nav">
        <button className="btn btn-outline" onClick={() => setStep(1)}>Назад</button>
        <button className="btn btn-primary" disabled={!selectedBarber} onClick={() => setStep(3)}>
          Далее
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="booking-step">
      <h3>Выберите дату и время</h3>
      <div className="datetime-picker">
        <div className="form-group">
          <label>Дата</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        {formData.date && availableTimes.length > 0 && (
          <div className="time-slots">
            <label>Доступное время</label>
            <div className="slots-grid">
              {availableTimes.map(time => (
                <button
                  key={time}
                  className={`time-slot ${formData.time === time ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, time })}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {formData.date && availableTimes.length === 0 && (
          <p className="no-times">Нет доступного времени на эту дату</p>
        )}
      </div>
      <div className="booking-nav">
        <button className="btn btn-outline" onClick={() => setStep(2)}>Назад</button>
        <button
          className="btn btn-primary"
          disabled={!formData.date || !formData.time}
          onClick={() => setStep(4)}
        >
          Далее
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="booking-step">
      <h3>Подтверждение записи</h3>
      <div className="booking-summary">
        <div className="summary-item">
          <strong>Услуга:</strong> {selectedService?.name}
        </div>
        <div className="summary-item">
          <strong>Барбер:</strong> {selectedBarber?.name}
        </div>
        <div className="summary-item">
          <strong>Дата:</strong> {formData.date}
        </div>
        <div className="summary-item">
          <strong>Время:</strong> {formData.time}
        </div>
        <div className="summary-item">
          <strong>Цена:</strong> {selectedService?.price} ₽
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>Имя</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ваше имя"
        />
      </div>
      
      <div className="form-group">
        <label>Телефон</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+7 (999) 123-45-67"
        />
      </div>
      
      <div className="form-group">
        <label>Комментарий (необязательно)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Пожелания к стрижке"
        />
      </div>
      
      <div className="booking-nav">
        <button className="btn btn-outline" onClick={() => setStep(3)}>Назад</button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !formData.name || !formData.phone}
        >
          {loading ? 'Запись...' : 'Подтвердить запись'}
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="booking-step booking-success">
      <div className="success-icon">✅</div>
      <h3>Запись успешно создана!</h3>
      <p>Мы ждем вас {formData.date} в {formData.time}</p>
      <button className="btn btn-primary" onClick={() => navigate('/profile')}>
        В личный кабинет
      </button>
    </div>
  );

  return (
    <div className="booking-page">
      <div className="container">
        <h2>Онлайн-запись</h2>
        
        <div className="booking-progress">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`progress-step ${step >= num ? 'active' : ''}`}>
              <span>{num}</span>
            </div>
          ))}
        </div>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>
    </div>
  );
};

export default Booking;
