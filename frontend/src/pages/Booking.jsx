import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceService, barberService, appointmentService } from '../services';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  
  const [formData, setFormData] = useState({
    notes: ''
  });
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesRes, barbersRes] = await Promise.all([
        serviceService.getAll(),
        barberService.getAll()
      ]);
      
      if (servicesRes.success) {
        setServices(servicesRes.data.services);
      }
      if (barbersRes.success) {
        setBarbers(barbersRes.data.barbers);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    
    if (selectedBarber && selectedService) {
      try {
        // Generate time slots based on service duration
        const startHour = 9;
        const endHour = 21;
        const duration = selectedService.duration_minutes;
        const times = [];
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const endTime = calculateEndTime(timeStr, duration);
            
            // Check availability
            try {
              const availRes = await barberService.checkAvailability(
                selectedBarber.id,
                date,
                timeStr,
                endTime
              );
              if (availRes.data.isAvailable) {
                times.push(timeStr);
              }
            } catch (e) {
              // Slot not available
            }
          }
        }
        
        setAvailableTimes(times);
      } catch (err) {
        console.error('Error checking availability:', err);
      }
    }
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const endMinutes = String(totalMinutes % 60).padStart(2, '0');
    return `${endHours}:${endMinutes}`;
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      setError('Please complete all steps');
      return;
    }

    try {
      setLoading(true);
      const response = await appointmentService.create({
        service_id: selectedService.id,
        barber_id: selectedBarber.id,
        appointment_date: selectedDate,
        start_time: selectedTime,
        notes: formData.notes
      });

      if (response.success) {
        setSuccess('Appointment booked successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedService) {
      setError('Please select a service');
      return;
    }
    if (step === 2 && !selectedBarber) {
      setError('Please select a barber');
      return;
    }
    if (step === 3 && (!selectedDate || !selectedTime)) {
      setError('Please select date and time');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  if (loading && services.length === 0) {
    return (
      <div className="booking-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-steps">
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Service</div>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Barber</div>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Date & Time</div>
          </div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Confirm</div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div>
            <h2>Select Service</h2>
            {services.map(service => (
              <div
                key={service.id}
                className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(service)}
              >
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <p>Duration: {service.duration_minutes} minutes</p>
                <p className="price">${service.price}</p>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Select Barber */}
        {step === 2 && (
          <div>
            <h2>Select Barber</h2>
            {barbers.map(barber => (
              <div
                key={barber.id}
                className={`barber-card ${selectedBarber?.id === barber.id ? 'selected' : ''}`}
                onClick={() => setSelectedBarber(barber)}
              >
                <h3>{barber.user?.full_name || 'Barber'}</h3>
                <p>{barber.specialization || 'Professional Barber'}</p>
                {barber.rating && (
                  <p>
                    Rating: {barber.rating} ★ ({barber.total_reviews || 0} reviews)
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div>
            <h2>Select Date & Time</h2>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            {selectedDate && (
              <>
                <label>Available Times</label>
                <div className="time-slots">
                  {availableTimes.length > 0 ? (
                    availableTimes.map(time => (
                      <div
                        key={time}
                        className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </div>
                    ))
                  ) : (
                    <p>No available slots for this date</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div>
            <h2>Confirm Booking</h2>
            <div className="summary-box">
              <div className="summary-item">
                <span>Service:</span>
                <span>{selectedService?.name}</span>
              </div>
              <div className="summary-item">
                <span>Barber:</span>
                <span>{selectedBarber?.user?.full_name || 'Selected Barber'}</span>
              </div>
              <div className="summary-item">
                <span>Date:</span>
                <span>{selectedDate}</span>
              </div>
              <div className="summary-item">
                <span>Time:</span>
                <span>{selectedTime}</span>
              </div>
              <div className="summary-item">
                <span>Duration:</span>
                <span>{selectedService?.duration_minutes} minutes</span>
              </div>
              <div className="summary-item">
                <span>Price:</span>
                <span>${selectedService?.price}</span>
              </div>
              
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special requests..."
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="booking-actions">
          {step > 1 && step < 4 && (
            <button className="btn-secondary" onClick={prevStep}>
              Previous
            </button>
          )}
          
          {step < 3 && (
            <button className="btn-primary" onClick={nextStep}>
              Next
            </button>
          )}
          
          {step === 3 && (
            <button className="btn-primary" onClick={nextStep}>
              Review
            </button>
          )}
          
          {step === 4 && (
            <button 
              className="btn-primary" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
