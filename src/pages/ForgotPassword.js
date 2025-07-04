import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset link sent!');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        alert('Error: This email is not registered.');
      } else if (err.code === 'auth/invalid-email') {
        alert('Error: Invalid email address.');
      } else {
        alert('Error: ' + err.message);
      }
    }
  };

  return (
    <div className="forgot-container">
      <h2>Forgot Your Password?</h2>
      <form className="forgot-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
        <div className="forgot-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
