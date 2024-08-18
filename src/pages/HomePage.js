// src/pages/HomePage.js
import React from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router

function HomePage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the login route
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="logo">Noble Asset Vault</div>
        <nav className="nav">
          <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
        <button className="login-button" onClick={handleLoginClick}>Login</button>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Noble Asset Vault</h1>
          <p>Where Your Assets Are Treasured, Not Just Stored</p>
          <a href="#about" className="cta-button">Learn More</a>
        </div>
      </section>

      <section id="about" className="about">
        <h2>About Us</h2>
        <p>We are a digital agency specializing in creating stunning and user-friendly websites.</p>
      </section>

      <section id="services" className="services">
        <h2>Our Services</h2>
        <div className="service-cards">
          <div className="card">
            <h3>Web Design</h3>
            <p>Beautiful and responsive web designs.</p>
          </div>
          <div className="card">
            <h3>Development</h3>
            <p>High-performance web applications.</p>
          </div>
          <div className="card">
            <h3>SEO</h3>
            <p>Optimize your site to rank higher on search engines.</p>
          </div>
        </div>
      </section>

      <section id="portfolio" className="portfolio">
        <h2>Our Portfolio</h2>
        <div className="portfolio-grid">
          <div className="portfolio-item">Project 1</div>
          <div className="portfolio-item">Project 2</div>
          <div className="portfolio-item">Project 3</div>
          <div className="portfolio-item">Project 4</div>
        </div>
      </section>

      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <textarea placeholder="Your Message"></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>

      <footer className="footer">
        <p>© 2024 MySophisticatedSite. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
