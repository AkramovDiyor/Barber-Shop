import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">✂️</span>
          <span className="logo-text">BarberShop</span>
        </Link>
        
        <nav className="nav">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/#services" className="nav-link">Услуги</Link>
          <Link to="/#barbers" className="nav-link">Барберы</Link>
          <Link to="/#reviews" className="nav-link">Отзывы</Link>
          <Link to="/#contacts" className="nav-link">Контакты</Link>
        </nav>

        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline">Админ-панель</Link>
              )}
              <Link to="/profile" className="btn btn-outline">{user.name}</Link>
              <button onClick={handleLogout} className="btn btn-primary">Выход</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Вход</Link>
              <Link to="/booking" className="btn btn-primary">Записаться</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
