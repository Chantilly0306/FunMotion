// pages/GameWipeGlass.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoseTracker from '../components/PoseTracker';
import './GameWipeGlass.css';

export default function GameWipeGlass() {
  const [gameCompleted, setGameCompleted] = useState(false);
  const [scenery, setScenery] = useState('');
  const [wipeRatio, setWipeRatio] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 15) + 1;
    setScenery(`/scenery${String(randomIndex).padStart(2, '0')}.png`);
  }, []);

  const handleWipeComplete = () => {
    setGameCompleted(true);
    setTimeout(() => navigate('/game-menu'), 2000);
  };

  return (
    <div className="game-container">
      {/* ✅ 讓 PoseTracker 在遊戲畫面外面（右上角固定） */}
      <PoseTracker
        mode="wipe"
        scenery={scenery}
        onWipeProgress={(ratio) => setWipeRatio(ratio)}
        onComplete={handleWipeComplete}
      />

      {/* ✅ 主遊戲畫面 */}
      {!gameCompleted ? (
        <div className="wipe-area">
          <img src={scenery} alt="Scenery" className="base-image" />
          <p className="progress-text">Progress: {Math.floor(wipeRatio * 100)}%</p>
        </div>
      ) : (
        <div className="scenery-container">
          <img src={scenery} alt="Scenery" className="scenery-image" />
          <p>🎉 Congratulations!</p>
        </div>
      )}
    </div>
  );
}
