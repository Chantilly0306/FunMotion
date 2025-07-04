import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';

import './ResetPassword.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // get URL's reset code（oobCode）
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get('oobCode');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      setError('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
      setSuccess(false);
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Your Password</h2>
      <form className="reset-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {success && <p className="success-message">Password reset successful! Redirecting to login...</p>}
      {error && <p className="error-message">Error: {error}</p>}
    </div>
  );
}

export default ResetPassword;
