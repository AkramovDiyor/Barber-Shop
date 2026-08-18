import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import menuImg from '../../public/menu.png';
import closeImg from '../../public/close.png';
import logoImg from '../../public/logo (3).png';

const Home = () => {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const savedState = localStorage.getItem('menuState');
    if (savedState === 'open') {
      setSideNavOpen(true);
    }
  }, []);

  const toggleMenu = () => {
    const newState = !sideNavOpen;
    setSideNavOpen(newState);
    localStorage.setItem('menuState', newState ? 'open' : 'closed');
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (sideNavOpen) {
      toggleMenu();
    }
  };

  return (
    <>
      <section id="banner">
        <img src={logoImg} alt="logo" className="logo" />
        <div className="banner-text">
          <h1>Hair Studio</h1>
          <p>Style Your Hair Is Style Your Life!</p>
          <div className="banner-btn">
            <a onClick={() => scrollToSection('feature')}><span></span>Find Out</a>
            <a onClick={() => scrollToSection('service')}><span></span>Read More</a>
          </div>
        </div>
      </section>

      <div id="sideNav" style={{ right: sideNavOpen ? '0' : '-250px' }}>
        <nav>
          <ul>
            <li><a onClick={() => scrollToSection('banner')}>HOME</a></li>
            <li><a onClick={() => scrollToSection('feature')}>FEATURES</a></li>
            <li><a onClick={() => scrollToSection('service')}>SERVICES</a></li>
            <li><a onClick={() => scrollToSection('testimonial')}>TESTIMONIALS</a></li>
            <li><a onClick={() => scrollToSection('footer')}>MEET US</a></li>
            {isAuthenticated && (
              <>
                <li><a onClick={() => window.location.href = '/profile'}>PROFILE</a></li>
                {user?.role === 'admin' && (
                  <li><a onClick={() => window.location.href = '/admin'}>ADMIN</a></li>
                )}
                <li><a onClick={logout}>LOGOUT</a></li>
              </>
            )}
            {!isAuthenticated && (
              <>
                <li><a onClick={() => window.location.href = '/login'}>LOGIN</a></li>
                <li><a onClick={() => window.location.href = '/register'}>REGISTER</a></li>
              </>
            )}
          </ul>
        </nav>
      </div>

      <div id="menuBtn" onClick={toggleMenu}>
        <img id="menu" src={sideNavOpen ? closeImg : menuImg} alt="menu" />
      </div>

      <section id="feature">
        <div className="title-text">
          <p>FEATURES</p>
          <h1>Why Choose Us</h1>
        </div>
        <div className="feature-box">
          <div className="features">
            <h1>Experienced Staff</h1>
            <div className="features-desc">
              <div className="feature-icon">
                <i className="fa fa-shield" aria-hidden="true"></i>
              </div>
              <div className="feature-text">
                <p>
                  Our team of professional barbers has years of experience. We stay updated with the latest trends and techniques.
                </p>
              </div>
            </div>
            <h1>Pre Booking Online</h1>
            <div className="features-desc">
              <div className="feature-icon">
                <i className="fa fa-check-square-o" aria-hidden="true"></i>
              </div>
              <div className="feature-text">
                <p>
                  Book your appointment online at your convenience. No more waiting in line - just show up at your scheduled time.
                </p>
              </div>
            </div>
            <h1>Affordable Cost</h1>
            <div className="features-desc">
              <div className="feature-icon">
                <i className="fa fa-inr" aria-hidden="true"></i>
              </div>
              <div className="feature-text">
                <p>
                  Quality service at affordable prices. We offer various packages to suit your budget without compromising on quality.
                </p>
              </div>
            </div>
          </div>
          <div className="features-img">
            <img src="/barber-man.jpeg" alt="barber-man" />
          </div>
        </div>
      </section>

      <section id="service">
        <div className="title-text">
          <p>SERVICES</p>
          <h1>We Provide Better</h1>
        </div>
        <div className="service-box">
          <div className="single-service" onClick={() => window.location.href = '/booking'}>
            <img src="/pic-1.jpeg" alt="pic-1" />
            <div className="overlay"></div>
            <div className="service-desc">
              <h3>Hair Styling</h3>
              <hr />
              <p>Professional hair styling with premium products for any occasion.</p>
            </div>
          </div>
          <div className="single-service" onClick={() => window.location.href = '/booking'}>
            <img src="/pic-2.jpeg" alt="pic-2" />
            <div className="overlay"></div>
            <div className="service-desc">
              <h3>Beard Trim</h3>
              <hr />
              <p>Precision beard trimming and shaping for a perfect look.</p>
            </div>
          </div>
          <div className="single-service" onClick={() => window.location.href = '/booking'}>
            <img src="/pic-3.jpeg" alt="pic-3" />
            <div className="overlay"></div>
            <div className="service-desc">
              <h3>Hair Cut</h3>
              <hr />
              <p>Classic or modern haircut tailored to your style preferences.</p>
            </div>
          </div>
          <div className="single-service" onClick={() => window.location.href = '/booking'}>
            <img src="/pic-4.jpeg" alt="pic-4" />
            <div className="overlay"></div>
            <div className="service-desc">
              <h3>Dry Shampoo</h3>
              <hr />
              <p>Quick hair cleaning without water for a fresh look.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonial">
        <div className="title-text">
          <p>TESTIMONIAL</p>
          <h1>What Client says</h1>
        </div>
        <div className="testimonial-row">
          <div className="testimonial-col">
            <div className="user">
              <img src="/img-1.jpeg" alt="user-1" />
              <div className="user-info">
                <h4>KEN NORMAN <i className="fa fa-twitter" aria-hidden="true"></i></h4>
                <small>@kennorman</small>
              </div>
            </div>
            <p>
              Best barbershop in town! The staff is professional and the atmosphere is amazing. Highly recommend!
            </p>
          </div>
          <div className="testimonial-col">
            <div className="user">
              <img src="/img-2.jpeg" alt="user-2" />
              <div className="user-info">
                <h4>Liara Karian <i className="fa fa-twitter" aria-hidden="true"></i></h4>
                <small>@liarakarian</small>
              </div>
            </div>
            <p>
              Great service and attention to detail. My husband always looks fantastic after his visits here.
            </p>
          </div>
          <div className="testimonial-col">
            <div className="user">
              <img src="/img-3.jpeg" alt="user-3" />
              <div className="user-info">
                <h4>Ricky Danial <i className="fa fa-twitter" aria-hidden="true"></i></h4>
                <small>@rickydanial</small>
              </div>
            </div>
            <p>
              I've been coming here for years. Consistent quality and friendly service every time. Worth every penny!
            </p>
          </div>
        </div>
      </section>

      <section id="footer">
        <img src="/footer-img.png" className="footer-img" alt="footer Image" />
        <div className="title-text">
          <p>Contact</p>
          <h1>Visit shop today</h1>
        </div>
        <div className="footer-row">
          <div className="footer-left">
            <h1>Opening Hours</h1>
            <p><i className="fa fa-clock-o" aria-hidden="true"></i>Monday to Friday - 9am to 9pm</p>
            <p><i className="fa fa-clock-o" aria-hidden="true"></i>Saturday and Sunday - 8am to 11pm</p>
          </div>
          <div className="footer-right">
            <h1>Get in Touch</h1>
            <p>УЗГЕН РАЙОН<i className="fa fa-map-marker" aria-hidden="true"></i></p>
            <p>bek@gmail.com<i className="fa fa-paper-plane" aria-hidden="true"></i></p>
            <p>+996995331126<i className="fa fa-phone" aria-hidden="true"></i></p>
          </div>
        </div>
        <div className="social-links">
          <i className="fa fa-facebook" aria-hidden="true"></i>
          <i className="fa fa-instagram" aria-hidden="true"></i>
          <i className="fa fa-twitter" aria-hidden="true"></i>
          <i className="fa fa-youtube-play" aria-hidden="true"></i>
          <p>Copyright all rights reserved.</p>
        </div>
      </section>
    </>
  );
};

export default Home;
