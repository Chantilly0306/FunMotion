import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    nickname: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build account on Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // Build first data on Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: form.email,
        nickname: form.nickname,
        createdAt: new Date(),
      });

      alert('Sign up successful!');
      navigate('/Profile');

    } catch (error) {
      console.error('Sign up error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Register in FunMotion</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="nickname"
          placeholder="Nickname"
          autoComplete="name"
          value={form.nickname}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;
