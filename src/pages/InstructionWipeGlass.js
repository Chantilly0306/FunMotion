// pages/InstructionWipeGlass.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InstructionWipeGlass.css';

export default function InstructionWipeGame() {
  const [side, setSide] = useState('right');
  const [difficulty, setDifficulty] = useState('easy');
  const navigate = useNavigate();

  const startGame = () => {
    navigate('/game-wipe-glass', { state: { side, difficulty } });
  };

  return (
    <div className="instruction-wrapper">
      <div className="instruction-container">
        <h2 className="instruction-title">🧽 Wipe the Glass Game</h2>
        <p className="instruction-text">
          Use your hand to wipe the gray layer and reveal the beautiful scenery underneath. <br />
          Raise your arm and move your hand to clean as much as possible!
        </p>

        <div className="selector-group">
          <div className="selector-label">Select hand:</div>
          <div className="button-group">
            <button
              className={side === 'left' ? 'selected' : ''}
              onClick={() => setSide('left')}
            >
              Left
            </button>
            <button
              className={side === 'right' ? 'selected' : ''}
              onClick={() => setSide('right')}
            >
              Right
            </button>
          </div>

          <div className="selector-label">Select difficulty:</div>
          <div className="button-group">
            <button
              className={difficulty === 'easy' ? 'selected' : ''}
              onClick={() => setDifficulty('easy')}
            >
              Easy
            </button>
            <button
              className={difficulty === 'medium' ? 'selected' : ''}
              onClick={() => setDifficulty('medium')}
            >
              Medium
            </button>
            <button
              className={difficulty === 'difficult' ? 'selected' : ''}
              onClick={() => setDifficulty('difficult')}
            >
              Difficult
            </button>
          </div>
        </div>

        <button className="start-button" onClick={startGame}>
          Start Game
        </button>
      </div>
    </div>
  );
}
