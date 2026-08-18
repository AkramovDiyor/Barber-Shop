import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import BarberProfile from './pages/BarberProfile';
import { useAuth } from './context/AuthContext';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/barber/:id" element={<BarberProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
