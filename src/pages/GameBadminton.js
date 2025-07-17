// src/pages/GameBadminton.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BadmintonGameScene from '../components/BadmintonGameScene';
import PoseTracker from '../components/PoseTracker';

const directions = ['left', 'mid', 'right'];

const GameBadminton = () => {
  const [expectedDirection, setExpectedDirection] = useState(null);
  const [wristPos, setWristPos] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const interval = setInterval(() => {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      setExpectedDirection(dir);
      console.log('Direction of shuttle:', dir);
    }, 2000);

    const timeout = setTimeout(() => {
      navigate('/game-menu');
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  const handlePoseDetected = (userDir) => {
    console.log('Raising direction of hand:', userDir);
    if (userDir === expectedDirection) {
      alert('Hit! 🎯');
    } else {
      alert('Miss ❌');
    }
    setExpectedDirection(null); // 重置等待下一球
  };

  return (
    <div>
        <div style={{ width: '100vw', height: '100vh' }}>
          <BadmintonGameScene />
        </div>
        <PoseTracker
        mode="badminton"
        onPoseReady={handlePoseDetected}
        onRightWristMove={(x, y) => setWristPos({ x, y })}
        />
    </div>
  );
};

export default GameBadminton;