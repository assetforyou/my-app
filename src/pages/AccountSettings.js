import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import './AccountSettings.css';

function AccountSettings({ userEmail }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const user = auth.currentUser;
      await updatePassword(user, newPassword);
      
      // Update the password in Firestore if you're storing it there
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        password: newPassword // Note: It's generally not recommended to store passwords in Firestore
      });

      setMessage('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage(`Error updating password: ${error.message}`);
    }
  };

  return (
    <div className="account-settings">
      <h2>Account Settings</h2>
      <div className="user-info">
        <p><strong>Email:</strong> {userEmail}</p>
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
      {message && <p className="message">{message}</p>}
      <div className="other-settings">
        <h3>Other Settings</h3>
        <button>Notification Preferences</button>
        <button>Privacy Settings</button>
      </div>
    </div>
  );
}

export default AccountSettings;