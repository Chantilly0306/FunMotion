// pages/Record.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Record.css';

export default function Record() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    return (
      <div className="record-container">
        <h2>No record found</h2>
        <button onClick={() => navigate('/game-menu')}>Back to Home</button>
      </div>
    );
  }

  const { duration, shoulder, elbow, difficulty, hand } = data;

  return (
    <div className="record-container">
      <h2>🎉 Game Result Saved!</h2>
      <div className="record-info">
        <p><strong>Side:</strong> {hand}</p>
        <p><strong>Difficulty:</strong> {difficulty}</p>
        <p><strong>Duration:</strong> {duration.toFixed(2)} seconds</p>
        <p><strong>Max Shoulder Flexion:</strong> {shoulder.toFixed(2)}°</p>
        <p><strong>Max Elbow Extension:</strong> {elbow.toFixed(2)}°</p>
      </div>
      <button className="back-button" onClick={() => navigate('/game-menu')}>🏠 Back to Home</button>
    </div>
  );
} 
