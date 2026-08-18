import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, barbersRes, reviewsRes] = await Promise.all([
          api.get('/services'),
          api.get('/barbers'),
          api.get('/reviews?status=approved')
        ]);
        setServices(servicesRes.data);
        setBarbers(barbersRes.data);
        setReviews(reviewsRes.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1>Стильные мужские стрижки</h1>
          <p>Профессиональные барберы, уютная атмосфера и безупречный стиль</p>
          <Link to="/booking" className="btn btn-primary btn-large">Записаться онлайн</Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="section services" id="services">
        <div className="container">
          <h2 className="section-title">Наши услуги</h2>
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-image">
                  <span className="service-placeholder">✂️</span>
                </div>
                <div className="service-info">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-meta">
                    <span className="duration">⏱️ {service.duration} мин</span>
                    <span className="price">{service.price} ₽</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barbers Section */}
      <section className="section barbers" id="barbers">
        <div className="container">
          <h2 className="section-title">Наши барберы</h2>
          <div className="barbers-grid">
            {barbers.map(barber => (
              <div key={barber.id} className="barber-card">
                <div className="barber-image">
                  <span className="barber-placeholder">👨‍🦱</span>
                </div>
                <div className="barber-info">
                  <h3>{barber.name}</h3>
                  <p className="specialization">{barber.specialization}</p>
                  <div className="barber-meta">
                    <span className="rating">⭐ {barber.rating}</span>
                    <span className="experience">{barber.experience} лет опыта</span>
                  </div>
                  <Link to={`/barber/${barber.id}`} className="btn btn-outline btn-small">Подробнее</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section reviews" id="reviews">
        <div className="container">
          <h2 className="section-title">Отзывы клиентов</h2>
          <div className="reviews-grid">
            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <span className="review-author">{review.userName}</span>
                  <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-barber">Барбер: {review.barberName}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta">
        <div className="container">
          <h2>Готовы создать свой стиль?</h2>
          <p>Запишитесь прямо сейчас и получите скидку 10% на первый визит</p>
          <Link to="/booking" className="btn btn-primary btn-large">Записаться</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
