import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 加入 Link 元件
import './Login.css';

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', form);
    alert('Logged in successfully!');
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
        <button type="submit">Log In</button>
        <div className="login-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <span> | </span>
          <Link to="/signup">Sign Up</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
