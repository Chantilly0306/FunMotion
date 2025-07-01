import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; // ⚠️ 確保你在 firebase.js export 了 db

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
      // 1. Firebase Auth 建立帳號
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // 2. Firestore 建立初始資料
      await setDoc(doc(db, 'users', user.uid), {
        email: form.email,
        nickname: form.nickname,
        createdAt: new Date(),
      });

      alert('Sign up successful!');
      navigate('/Profile'); // ✅ 導向填寫基本資料頁面

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
