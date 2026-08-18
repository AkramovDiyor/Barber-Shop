import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer" id="contacts">
      <div className="container footer-container">
        <div className="footer-section">
          <h3>BarberShop</h3>
          <p>Лучший барбершоп в городе</p>
          <div className="social-links">
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Telegram">✈️</a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Навигация</h4>
          <Link to="/">Главная</Link>
          <Link to="/#services">Услуги</Link>
          <Link to="/#barbers">Барберы</Link>
          <Link to="/booking">Записаться</Link>
        </div>
        
        <div className="footer-section">
          <h4>Контакты</h4>
          <p>📍 ул. Примерная, 123</p>
          <p>📞 +7 (999) 123-45-67</p>
          <p>⏰ Ежедневно 10:00 - 22:00</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} BarberShop. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;
