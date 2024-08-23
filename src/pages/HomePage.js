// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Ensure this file is created with the styles below

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

      <section id="about" className="section about-us-section">
        <div className="about-us-content">
          <h2>About Us</h2>
          <p className="about-us-intro">
            At Noble Asset Vault, we understand that managing a diverse range of assets can be overwhelming. From your home and car to cash in the bank, digital assets, and stock portfolios, keeping track of it all is a challenge. That’s why we’ve created a platform where you can consolidate all your assets in one place, offering a streamlined solution to asset management.
          </p>
          <div className="about-us-features">
            <div className="feature-card">
              <h3>Comprehensive Tracking</h3>
              <p>Manage all your assets in one centralized location, simplifying your financial life.</p>
            </div>
            <div className="feature-card">
              <h3>Privacy and Security</h3>
              <p>Your data is safe with us. Control what you share and with whom.</p>
            </div>
            <div className="feature-card">
              <h3>Expert Solutions</h3>
              <p>Access both free and premium features tailored to your asset management needs.</p>
            </div>
          </div>
          <h3>Our Journey</h3>
          <p>
            We started with a simple idea: to build a sample website that could serve as a proof of concept. From there, we acquired a domain, began publishing articles, and built a robust platform. Our next steps include deploying the website for public use, engaging with users, and attracting investors to scale our operations.
          </p>
          <h3>The Future of Asset Management</h3>
          <p>
            Looking ahead, Noble Asset Vault will continue to innovate, offering advanced features that cater to the evolving needs of our users. Whether you're looking to manage your assets privately or share your profile with select information, our platform is here to support your financial goals.
          </p>
        </div>
      </section>

      <section id="services" className="section">
        <h2>Our Services</h2>
        <div className="service-cards">
          <div className="card">
            <h3>Asset Management Dashboard</h3>
            <p>Track and manage all your assets in one place with our comprehensive dashboard.</p>
          </div>
          <div className="card">
            <h3>Secure Asset Storage</h3>
            <p>Store your asset information securely with our advanced encryption and privacy controls.</p>
          </div>
          <div className="card">
            <h3>Financial Planning Tools</h3>
            <p>Set goals, track progress, and optimize your asset allocation for long-term growth.</p>
          </div>
          <div className="card">
            <h3>Asset Valuation and Analysis</h3>
            <p>Get accurate valuations and personalized recommendations to enhance your portfolio.</p>
          </div>
          <div className="card">
            <h3>Estate Planning Assistance</h3>
            <p>Manage your estate planning documents and ensure your assets are distributed as you wish.</p>
          </div>
          <div className="card">
            <h3>Premium Features</h3>
            <p>Access advanced reporting, priority support, and personalized financial advice.</p>
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

      <section id="contact" className="section contact-us-section">
        <h2>Contact Us</h2>
        <form className="contact-form" action="mailto:assetforryou@gmail.com" method="post" encType="text/plain">
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" placeholder="Your Message" required></textarea>
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
