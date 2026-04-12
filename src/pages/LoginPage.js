import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import '../style/LoginPage.css';
import logo_transparent from '../images/logo_transparent.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/landing', { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/landing');
    } catch {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="auth-page auth-page--login">
      <div className="auth-page__brand">
        <div className="auth-page__brand-inner">
          <Link to="/" className="auth-page__logo-link">
            <img src={logo_transparent} alt="" aria-hidden />
            Vault Knight
          </Link>
          <p className="auth-page__tagline">
            Welcome back to your <span>private vault</span>
          </p>
          <p className="auth-page__sub">
            Sign in to view your portfolio, analytics, and asset ledger in one secure place.
          </p>
        </div>
        <p className="auth-page__footer-note">Encrypted session · Firebase Authentication</p>
      </div>
      <div className="auth-page__panel">
        <div className="auth-page__panel-inner">
          <h1>Sign in</h1>
          <p className="auth-lead">Use the email and password for your Vault Knight account.</p>
          <form onSubmit={handleLogin}>
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button type="submit">Continue</button>
            {error && <p className="error" role="alert">{error}</p>}
          </form>
          <div className="auth-page__switch">
            <p>
              New to Vault Knight? <Link to="/signup">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
