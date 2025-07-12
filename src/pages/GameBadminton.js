// src/pages/GameBadminton.js
import React, { useState } from 'react';
import BadmintonGameScene from '../components/BadmintonGameScene';
import PoseTracker from '../components/PoseTracker';

const GameBadminton = () => {
  const [expectedDirection, setExpectedDirection] = useState(null);
  const [wristPos, setWristPos] = useState(null);
  const handleShuttleHit = (dir) => {
    setExpectedDirection(dir);
    console.log('飛來方向:', dir);
  };

  const handlePoseDetected = (userDir) => {
    console.log('使用者舉手方向:', userDir);
    if (userDir === expectedDirection) {
      alert('Hit! 🎯');
    } else {
      alert('Miss ❌');
    }
    setExpectedDirection(null); // 重置等待下一球
  };

  return (
    <div>
        <BadmintonGameScene
        onShuttleHit={handleShuttleHit}
        expectedDirection={expectedDirection}
        wristPosition={wristPos}
        />
        <PoseTracker
        mode="badminton"
        onPoseReady={handlePoseDetected}
        onRightWristMove={(x, y) => setWristPos({ x, y })}
        />
    </div>
  );
};

export default GameBadminton;
