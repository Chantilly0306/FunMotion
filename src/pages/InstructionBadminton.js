// pages/InstructionBadminton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InstructionBadminton.css';

export default function InstructionBadminton() {
  const navigate = useNavigate();

  const startGame = () => {
    navigate('/game-badminton');
  };

  return (
    <div className="instruction-wrapper">
      <div className="instruction-container">
        <h2 className="instruction-title">🏸 Badminton Game</h2>
        <p className="instruction-text">
          When you see the shuttlecock, raise your hand.<br />
          Raise your hand toward left if it comes from the left,<br />
          raise your hand in the center if it comes from the center,<br />
          and raise your hand toward right if it comes from the right.
        </p>

        <button className="start-button" onClick={startGame}>
          Start Game
        </button>
      </div>
    </div>
  );
}
