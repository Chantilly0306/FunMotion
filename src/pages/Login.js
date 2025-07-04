import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, browserLocalPersistence, browserSessionPersistence, setPersistence } from 'firebase/auth';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setPersistence(auth, form.remember ? browserLocalPersistence : browserSessionPersistence);

      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      alert('Login successful!');
      navigate('/GameMenu');
    } 
    catch (error) {
      console.error('Login error:', error.code, error.message);
      alert('Login failed. Please check your email and password or try resetting your password.');
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome Back to FunMotion</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <label>
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
          />
          Remember me
        </label>
        <button type="submit">Log In</button>
        <div className="login-links">
          <a href="/forgot-password">Forgot Password?</a>
          <span> | </span>
          <a href="/signup">Sign Up</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
