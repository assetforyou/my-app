import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaChartLine, FaLock, FaUser, FaBuilding } from 'react-icons/fa';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const contactRef = useRef(null);
  const [formStatus, setFormStatus] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    inquiryType: '',
    message: ''
  });

  const handleNavigation = (path) => {
    if (path === '/demo') {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('Sending message...');
  
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recipientEmail: 'assetforryou@gmail.com'
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
  
      setFormStatus('Message sent');
      setFormData({
        fullName: '',
        email: '',
        inquiryType: '',
        message: ''
      });
    } catch (error) {
      console.error('Error:', error);
      setFormStatus('Error sending message. Please try again.');
    }
  };  

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="container">
          <div className="logo">Noble Asset Vault</div>
          <nav className="nav">
            <ul>
              {['About', 'Services', 'Solutions', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`}>{item}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="auth-buttons">
            <button className="login-button" onClick={() => handleNavigation('/login')}>Login</button>
            <button className="signup-button" onClick={() => handleNavigation('/signup')}>Sign Up</button>
          </div>
        </div>
      </header>

      <motion.section className="hero" {...fadeInUp}>
        <div className="hero-content">
          <h1>Secure Your Digital Fortune</h1>
          <p>Advanced Asset Management for the Modern Investor</p>
          <button className="cta-button" onClick={() => handleNavigation('/demo')}>
            Request a Demo
          </button>
        </div>
      </motion.section>

      <motion.section id="about" className="section about-section" {...fadeInUp}>
        <div className="container">
          <h2>About Noble Asset Vault</h2>
          <p>
            At Noble Asset Vault, we combine cutting-edge technology with financial expertise to provide a secure, 
            comprehensive asset management platform. Our solution caters to both individual investors and 
            financial institutions, offering unparalleled security and insights for your digital assets.
          </p>
          <div className="feature-grid">
            {[
              { icon: <FaShieldAlt />, title: 'Bank-Grade Security', description: 'Multi-layer encryption and advanced protocols' },
              { icon: <FaChartLine />, title: 'Real-Time Analytics', description: 'Comprehensive dashboards and performance tracking' },
              { icon: <FaLock />, title: 'Privacy First', description: 'Your data remains yours, always' }
            ].map((feature, index) => (
              <motion.div key={index} className="feature-card" whileHover={{ scale: 1.05 }}>
                {feature.icon}
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section id="services" className="section services-section" {...fadeInUp}>
        <div className="container">
          <h2>Our Services</h2>
          <div className="service-grid">
            {[
              'Asset Tracking & Management',
              'Portfolio Analysis',
              'Secure Information Storage'
            ].map((service, index) => (
              <motion.div key={index} className="service-card" whileHover={{ scale: 1.05 }}>
                <h3>{service}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section id="solutions" className="section solutions-section" {...fadeInUp}>
        <div className="container">
          <h2>Tailored Solutions</h2>
          <div className="solutions-grid">
            <motion.div className="solution-card" whileHover={{ scale: 1.05 }}>
              <FaUser className="solution-icon" />
              <h3>For Individuals</h3>
              <ul>
                <li>Personal Asset Dashboard</li>
                <li>Goal-based Planning</li>
              </ul>
            </motion.div>
            <motion.div className="solution-card" whileHover={{ scale: 1.05 }}>
              <FaBuilding className="solution-icon" />
              <h3>For Institutions</h3>
              <ul>
                <li>Multi-User Access Control</li>
                <li>Customized Reporting</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section id="contact" className="section contact-section" {...fadeInUp} ref={contactRef}>
        <div className="container">
          <h2>Get in Touch</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              required
            />
            <select
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Inquiry Type</option>
              <option value="demo">Request Demo</option>
              <option value="support">Technical Support</option>
            </select>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Your Message"
              required
            ></textarea>
            <button type="submit" disabled={formStatus === 'Sending message...'}>
              {formStatus || 'Send Message'}
            </button>
          </form>
        </div>
      </motion.section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">Noble Asset Vault</div>
            <div className="footer-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/careers">Careers</a>
            </div>
          </div>
          <p>&copy; {new Date().getFullYear()} Noble Asset Vault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;