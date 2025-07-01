import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase'; // 這裡導入剛剛寫的 firebase.js

function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent!");
    } catch (error) {
      alert("Error: " + error.message);
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
