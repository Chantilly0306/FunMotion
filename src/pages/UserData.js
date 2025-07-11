// pages/UserData.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './UserData.css';

const UserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setUserData(snap.data());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const { email, createdAt, ...editableFields } = userData;
      await updateDoc(userRef, { ...editableFields, updatedAt: new Date() });
      alert('Profile updated.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>No user data found.</div>;

  return (
    <div className="userdata-container">
      <div className="userdata-top-right">
        <img
          src="/gamemenu-icon.png"
          alt="Game Menu"
          onClick={() => navigate('/game-menu')}
        />
        <img
          src="/dashboard-icon.png"
          alt="Dashboard"
          onClick={() => navigate('/dashboard')}
        />
      </div>

      <div className="userdata-header">Profile</div>

      <form className="userdata-form" onSubmit={(e) => e.preventDefault()}>
        <label>Email (read-only)</label>
        <input type="email" value={userData.email} readOnly />

        <label>Nickname</label>
        <input
          name="nickname"
          value={userData.nickname || ''}
          onChange={handleChange}
        />

        <label>Gender</label>
        <select name="gender" value={userData.gender || ''} onChange={handleChange}>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label>Birthdate</label>
        <input
          type="date"
          name="birthdate"
          value={userData.birthdate || ''}
          onChange={handleChange}
        />

        <label>Medical Condition</label>
        <select name="condition" value={userData.condition || ''} onChange={handleChange}>
          <option value="">Select</option>
          <option value="stroke">Stroke</option>
          <option value="spinal cord injury">Spinal Cord Injury</option>
          <option value="brain trauma">Brain Trauma</option>
          <option value="parkinson">Parkinson's Disease</option>
          <option value="hand injury">Hand Injury</option>
          <option value="other">Other conditions affecting limb movement</option>
          <option value="none">None</option>
        </select>

        <label>Affected Side</label>
        <select name="affectedSide" value={userData.affectedSide || ''} onChange={handleChange}>
          <option value="">Select</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="bilateral">Bilateral</option>
          <option value="none">None</option>
        </select>

        <button onClick={handleSave}>Save Changes</button>
      </form>
    </div>
  );
};

export default UserData;
