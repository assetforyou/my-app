import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import '../style/SignUpPage.css';
import logo_transparent from '../images/logo_transparent.png';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/landing', { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => navigate('/landing'))
      .catch((err) => {
        setError(err.message || 'Could not create account.');
      });
  };

  return (
    <div className="auth-page auth-page--signup">
      <div className="auth-page__brand">
        <div className="auth-page__brand-inner">
          <Link to="/" className="auth-page__logo-link">
            <img src={logo_transparent} alt="" aria-hidden />
            Vault Knight
          </Link>
          <p className="auth-page__tagline">
            Create your <span>vault</span> in minutes
          </p>
          <p className="auth-page__sub">
            Track cash, equities, property, crypto, and custom assets with a dashboard designed for clarity.
          </p>
        </div>
        <p className="auth-page__footer-note">No credit card required to explore</p>
      </div>
      <div className="auth-page__panel">
        <div className="auth-page__panel-inner">
          <h1>Create account</h1>
          <p className="auth-lead">Choose a strong password you have not used elsewhere.</p>
          <form onSubmit={handleSignUp}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button type="submit">Create account</button>
            {error && <p className="error" role="alert">{error}</p>}
          </form>
          <div className="auth-page__switch">
            <p>
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
