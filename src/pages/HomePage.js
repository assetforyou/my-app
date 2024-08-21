// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Make sure this file is created with the styles below

function HomePage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the login page
  };

  const handleSignUpClick = () => {
    navigate('/signup'); // Navigate to the sign-up page
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
        <div className="auth-buttons">
          <button className="login-button" onClick={handleLoginClick}>Login</button>
          <button className="signup-button" onClick={handleSignUpClick}>Sign Up</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Noble Asset Vault</h1>
          <p>Assets Are Treasured, Not Just Stored</p>
          <a href="#about" className="cta-button">Learn More</a>
        </div>
      </section>

      <section id="about" className="section">
        <h2>About Us</h2>
        <p>We are a digital agency specializing in creating stunning and user-friendly websites.</p>
      </section>

      <section id="services" className="section">
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

      <section id="portfolio" className="section">
        <h2>Our Portfolio</h2>
        <div className="portfolio-grid">
          <div className="portfolio-item">Project 1</div>
          <div className="portfolio-item">Project 2</div>
          <div className="portfolio-item">Project 3</div>
          <div className="portfolio-item">Project 4</div>
        </div>
      </section>

      <section id="contact" className="section">
        <h2>Contact Us</h2>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <textarea placeholder="Your Message"></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>

      <footer className="footer">
        <p>© 2024 Noble Asset Vault. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;

