// pages/GameWipeGlass.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoseTracker from '../components/PoseTracker';
import './GameWipeGlass.css';

export default function GameWipeGlass() {
  const [gameCompleted, setGameCompleted] = useState(false);
  const [scenery, setScenery] = useState('');
  const [wipeRatio, setWipeRatio] = useState(0);
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 15) + 1;
    setScenery(`/scenery${String(randomIndex).padStart(2, '0')}.png`);
  }, []);

  useEffect(() => {
    // 當圖片載入後畫灰玻璃遮罩
    const img = new Image();
    img.src = '/gray-glass.png';
    img.onload = () => {
      const canvas = overlayRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [scenery]);

  const eraseAt = (x, y) => {
    const canvas = overlayRef.current;
    const ctx = canvas.getContext('2d');
    const radius = 100; // 擦除大小
    ctx.clearRect(x - radius / 2, y - radius / 2, radius, radius);
  };  

  const handleWipeComplete = () => {
    setGameCompleted(true);
    setTimeout(() => navigate('/game-menu'), 2000);
  };

  return (
    <div className="game-container">
      <PoseTracker
        mode="wipe"
        scenery={scenery}
        onWipeProgress={(ratio) => setWipeRatio(ratio)}
        onComplete={handleWipeComplete}
        onRightWristMove={(x, y) => eraseAt(x, y)}
      />

      {!gameCompleted ? (
        <div className="wipe-area">
          <img src={scenery} alt="Scenery" className="base-image" />
          
          {/* 🎯 灰玻璃遮罩 canvas */}
          <canvas ref={overlayRef} className="overlay-canvas" />

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
