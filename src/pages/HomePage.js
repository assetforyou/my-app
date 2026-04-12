import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaChartLine, FaLock, FaUser, FaBuilding } from 'react-icons/fa';
import '../style/HomePage.css';
import logo_transparent from '../images/logo_transparent.png';

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
      contactRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          recipientEmail: process.env.REACT_APP_CONTACT_INBOX || undefined,
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
          <div className="title">
            <img src={logo_transparent} alt="" className="custom-title-icon" aria-hidden />
            Vault Knight
          </div>
          <nav className="nav" aria-label="Primary">
            <ul>
              {['About', 'Services', 'Solutions', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`}>{item}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="auth-buttons">
            <button type="button" className="login-button" onClick={() => handleNavigation('/login')}>Log in</button>
            <button type="button" className="signup-button" onClick={() => handleNavigation('/signup')}>Sign up</button>
          </div>
        </div>
      </header>

      <motion.section className="hero" {...fadeInUp}>
        <div className="hero-content">
          <p className="hero-eyebrow">Institutional clarity · Personal control</p>
          <h1>
            Secure your <span>digital fortune</span>
          </h1>
          <p>
            Advanced asset tracking, real-time insight, and a vault-grade experience—built for investors who expect more than a spreadsheet.
          </p>
          <button type="button" className="cta-button" onClick={() => handleNavigation('/demo')}>
            Request a demo
          </button>
        </div>
      </motion.section>

      <motion.section id="about" className="section about-section" {...fadeInUp} style={{ scrollMarginTop: '80px' }}>
        <div className="container">
          <h2>About Vault Knight</h2>
          <p className="section-intro">
            We combine disciplined engineering with thoughtful design so you can see every asset class in one calm, confident view—whether you are growing wealth or stewarding it.
          </p>
          <div className="feature-grid">
            {[
              { icon: <FaShieldAlt />, title: 'Bank-grade posture', description: 'Encryption in transit and at rest, with clear separation between identity and data.' },
              { icon: <FaChartLine />, title: 'Live portfolio signal', description: 'Dashboards that surface what moved, what matters, and what needs attention next.' },
              { icon: <FaLock />, title: 'Privacy by default', description: 'Your positions stay yours. No dark patterns—just transparent access and export.' }
            ].map((feature, index) => (
              <motion.div key={feature.title} className="feature-card" whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                {feature.icon}
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section id="services" className="section services-section" {...fadeInUp} style={{ scrollMarginTop: '80px' }}>
        <div className="container">
          <h2>Capabilities</h2>
          <p className="section-intro">
            Everything you need to operate a serious personal balance sheet—without the noise of consumer finance apps.
          </p>
          <div className="service-grid">
            {[
              'Multi-asset ledger & history',
              'Scenario-ready analytics',
              'Structured export for advisors'
            ].map((service) => (
              <motion.div key={service} className="service-card" whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <h3>{service}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section id="solutions" className="section solutions-section" {...fadeInUp} style={{ scrollMarginTop: '80px' }}>
        <div className="container">
          <h2>Who it is for</h2>
          <p className="section-intro">
            The same precision we bring to institutions—shaped for individuals and small teams who care about craft.
          </p>
          <div className="solutions-grid">
            <motion.div className="solution-card" whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
              <FaUser className="solution-icon" aria-hidden />
              <h3>Individuals</h3>
              <ul>
                <li>Unified net-worth canvas</li>
                <li>Goals, cash flow, and risk in context</li>
              </ul>
            </motion.div>
            <motion.div className="solution-card" whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
              <FaBuilding className="solution-icon" aria-hidden />
              <h3>Advisors & family offices</h3>
              <ul>
                <li>Role-ready views (coming soon)</li>
                <li>Audit-friendly record keeping</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section id="contact" className="section contact-section" {...fadeInUp} ref={contactRef} style={{ scrollMarginTop: '80px' }}>
        <div className="container">
          <h2>Speak with us</h2>
          <p className="section-intro">
            Tell us what you are building. We read every message and respond within two business days.
          </p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full name"
              autoComplete="name"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Work email"
              autoComplete="email"
              required
            />
            <select
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleInputChange}
              required
            >
              <option value="">Inquiry type</option>
              <option value="demo">Request demo</option>
              <option value="support">Technical support</option>
            </select>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="How can we help?"
              required
            />
            <button type="submit" disabled={formStatus === 'Sending message...'}>
              {formStatus === 'Sending message...' ? 'Sending…' : formStatus || 'Send message'}
            </button>
          </form>
        </div>
      </motion.section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">Vault Knight</div>
            <div className="footer-links">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/careers">Careers</a>
            </div>
          </div>
          <p>&copy; {new Date().getFullYear()} Vault Knight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
