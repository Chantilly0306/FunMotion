import React, { useState } from 'react';
import './SignUp.css';

function SignUp() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register data:', form);
    alert('Sign Up successfully！');
  };

  return (
    <div className="signup-container">
      <h2>Register in FunMotion</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="User Name"
          value={form.username}
          onChange={handleChange}
          required
        />
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;
