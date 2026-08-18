import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const BarberProfile = () => {
  const { id } = useParams();
  const [barber, setBarber] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barberRes, reviewsRes] = await Promise.all([
          api.get(`/barbers/${id}`),
          api.get(`/reviews/barber/${id}`)
        ]);
        setBarber(barberRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!barber) return <div className="error">Барбер не найден</div>;

  return (
    <div className="barber-profile-page">
      <div className="container">
        <div className="barber-profile-header">
          <div className="barber-avatar">👨‍🦱</div>
          <div className="barber-details">
            <h1>{barber.name}</h1>
            <p className="specialization">{barber.specialization}</p>
            <div className="barber-stats">
              <span className="stat">⭐ Рейтинг: {barber.rating}</span>
              <span className="stat">💼 Опыт: {barber.experience} лет</span>
            </div>
          </div>
        </div>

        <div className="barber-schedule">
          <h3>График работы</h3>
          <div className="schedule-grid">
            {Object.entries(barber.schedule).map(([day, hours]) => (
              <div key={day} className={`schedule-day ${!hours ? 'day-off' : ''}`}>
                <span className="day-name">{day === 'monday' ? 'Понедельник' : 
                  day === 'tuesday' ? 'Вторник' :
                  day === 'wednesday' ? 'Среда' :
                  day === 'thursday' ? 'Четверг' :
                  day === 'friday' ? 'Пятница' :
                  day === 'saturday' ? 'Суббота' : 'Воскресенье'}</span>
                <span className="day-hours">{hours ? `${hours.start} - ${hours.end}` : 'Выходной'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="barber-reviews">
          <h3>Отзывы ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p>Пока нет отзывов</p>
          ) : (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-author">{review.userName}</span>
                    <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarberProfile;
