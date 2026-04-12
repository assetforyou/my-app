import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updatePassword, updateProfile, linkWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from './Toast';
import '../style/AccountSettings.css';

function AccountSettings({ userEmail }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const { success, error: showError } = useToast();

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
      showError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    try {
      const user = auth.currentUser;
      await updatePassword(user, newPassword);
      success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showError(`Error updating password: ${err.message}`);
    }
  };

  const handleDisplayNameChange = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      showError('Display name cannot be empty');
      return;
    }
    
    try {
      const user = auth.currentUser;
      await updateProfile(user, { displayName: displayName });
      await updateDoc(doc(db, 'users', user.uid), { displayName: displayName });
      success('Display name updated successfully');
    } catch (err) {
      showError(`Error updating display name: ${err.message}`);
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
      success(`Successfully linked ${provider} account`);
    } catch (err) {
      showError(`Error linking account: ${err.message}`);
    }
  };

  const handleDarkModeToggle = async () => {
    try {
      const user = auth.currentUser;
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      document.body.classList.toggle('dark-mode', newDarkMode);
      await updateDoc(doc(db, 'users', user.uid), { darkMode: newDarkMode });
      success(`Dark mode ${newDarkMode ? 'enabled' : 'disabled'}`);
    } catch (err) {
      showError(`Error toggling dark mode: ${err.message}`);
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