import React from 'react';
import './LoginPage.css'; // Add CSS for styling the login page
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Assuming successful login:
    navigate('/landing');
  };
  return (
    <div className="login-page">
      <div className="login-content">
        <h1>Welcome to Noble Asset Vault</h1>
        <p>Please log in to access your account.</p>
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" required />

          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />

          <button type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

