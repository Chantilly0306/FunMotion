import React, { useState } from 'react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    gender: '',
    birthdate: '',
    condition: '',
    affectedSide: '',
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in first.');
      return;
    }
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          ...profile,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      alert('Profile saved successfully!');
      navigate('/game-menu');
    } catch (error) {
      console.error('Save failed:', error.message);
      alert('Failed to save: ' + error.message);
    }
  };

  return (
    <div className="profile-container">
      <h2>Complete Your Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <label>Gender</label>
        <select name="gender" value={profile.gender} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label>Birthdate</label>
        <input type="date" name="birthdate" value={profile.birthdate} onChange={handleChange} required />

        <label>Medical Condition</label>
        <select name="condition" value={profile.condition} onChange={handleChange} required>
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
        <select name="affectedSide" value={profile.affectedSide} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="bilateral">Bilateral</option>
          <option value="none">None</option>
        </select>

        <button type="submit">Save and Continue</button>
      </form>
    </div>
  );
}

export default Profile;
