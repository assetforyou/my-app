import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updatePassword, updateProfile, linkWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import '../style/AccountSettings.css';

function AccountSettings({ userEmail }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setDisplayName(user.displayName || '');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDarkMode(userData.darkMode || false);
          document.body.classList.toggle('dark-mode', userData.darkMode);
        } else {
          // If the user document doesn't exist, create it with default settings
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName || '',
            darkMode: false
          });
        }
      }
    };
    fetchUserData();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const user = auth.currentUser;
      await updatePassword(user, newPassword);
      setMessage('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage(`Error updating password: ${error.message}`);
    }
  };

  const handleDisplayNameChange = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      await updateProfile(user, { displayName: displayName });
      await updateDoc(doc(db, 'users', user.uid), { displayName: displayName });
      setMessage('Display name updated successfully');
    } catch (error) {
      setMessage(`Error updating display name: ${error.message}`);
    }
  };

  const handleLinkAccount = async (provider) => {
    try {
      const user = auth.currentUser;
      if (provider === 'google') {
        await linkWithPopup(user, new GoogleAuthProvider());
      } else if (provider === 'github') {
        await linkWithPopup(user, new GithubAuthProvider());
      }
      setMessage(`Successfully linked ${provider} account`);
    } catch (error) {
      setMessage(`Error linking account: ${error.message}`);
    }
  };

  const handleDarkModeToggle = async () => {
    try {
      const user = auth.currentUser;
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      document.body.classList.toggle('dark-mode', newDarkMode);
      await updateDoc(doc(db, 'users', user.uid), { darkMode: newDarkMode });
      setMessage(`Dark mode ${newDarkMode ? 'enabled' : 'disabled'}`);
    } catch (error) {
      setMessage(`Error toggling dark mode: ${error.message}`);
    }
  };

  return (
    <div className="account-settings">
      <h2>Account Settings</h2>
      <div className="user-info">
        <p><strong>Email:</strong> {userEmail}</p>
        <p><strong>Display Name:</strong> {displayName}</p>
      </div>
      <form onSubmit={handlePasswordChange} className="password-form">
        <h3>Change Password</h3>
        <div className="form-group">
          <label htmlFor="new-password">New Password:</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm New Password:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Password</button>
      </form>
      <form onSubmit={handleDisplayNameChange} className="display-name-form">
        <h3>Change Display Name</h3>
        <div className="form-group">
          <label htmlFor="display-name">Display Name:</label>
          <input
            type="text"
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Display Name</button>
      </form>
      {message && <p className="message">{message}</p>}
      <div className="other-settings">
        <h3>Other Settings</h3>
        <button onClick={handleDarkModeToggle} className="dark-mode-toggle">
          {darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}
        </button>
      </div>
    </div>
  );
}

export default AccountSettings;