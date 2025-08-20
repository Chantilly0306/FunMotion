// pages/GameWipeGlass.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import PoseTracker from '../components/PoseTracker';
import './GameWipeGlass.css';

export default function GameWipeGlass() {
  const [gameCompleted, setGameCompleted] = useState(false); // Whether the game is finished
  const [scenery, setScenery] = useState('');                // Current background scenery image
  const [wipeRatio, setWipeRatio] = useState(0);             // Progress of wiping (0 ~ 1)
  const [startTime, setStartTime] = useState(null);          // Game start time
  const [shoulderFlex, setShoulderFlex] = useState(0);       // Real-time shoulder flexion angle
  const [elbowExtend, setElbowExtend] = useState(0);         // Real-time elbow extension angle
  const frameCountRef = useRef(0);                           // Frame counter (to optimize calculation frequency)
  const overlayRef = useRef(null);                           // Canvas reference for gray overlay
  const navigate = useNavigate();
  const location = useLocation();

  const { side = 'right', difficulty = 'easy' } = location.state || {};
  const eraseRadius = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 150 : 100;

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 15) + 1;
    setScenery(`/scenery${String(randomIndex).padStart(2, '0')}.png`); // Pick a random scenery image (01 ~ 15)
    setStartTime(Date.now());
  }, []);

  useEffect(() => { // Draw initial gray-glass overlay on canvas
    const img = new Image();
    img.src = '/gray-glass.png';
    img.onload = () => {
      const canvas = overlayRef.current;
      const ctx = canvas.getContext('2d');
      const displayWidth = canvas.clientWidth; // Match canvas size to container
      const displayHeight = canvas.clientHeight;
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight); // Fill the whole area with gray overlay
    };
  }, [scenery]);

  // Erase a small area on the overlay when wrist moves
  const eraseAt = (relX, relY) => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert normalized wrist coordinates into canvas pixels
    const x = relX * canvas.width;
    const y = relY * canvas.height;

    ctx.clearRect(x - eraseRadius / 2, y - eraseRadius / 2, eraseRadius, eraseRadius);

    // Update progress every 5 frames (to reduce calculation load)
    frameCountRef.current++;
    if (frameCountRef.current % 5 !== 0) return;

    // Count number of transparent pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentCount++;
    }

    const totalPixels = canvas.width * canvas.height;
    const ratio = transparentCount / totalPixels;
    setWipeRatio(ratio);

    if (ratio >= 0.90 && !gameCompleted) { // When 90% of the overlay is erased, complete the game
      handleWipeComplete();
    }
  };

  const handleWipeComplete = async () => {
    setGameCompleted(true);
    const duration = (Date.now() - startTime) / 1000;
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error('User not logged in');
      return;
    }

    try { // Save game record to Firestore under users/{uid}/wipeGlass/{side}/{difficulty}
      const recordRef = collection(
        db,
        'users',
        userId,
        'wipeGlass',
        side,
        difficulty
      );

      await addDoc(recordRef, {
        timestamp: serverTimestamp(),
        shoulderFlex,
        elbowExtend,
        duration,
      });

      console.log('Game record saved');

      // Redirect to record page after 4 seconds
      setTimeout(() => {
        navigate('/record', {
          state: {
            duration,
            shoulder: shoulderFlex,
            elbow: elbowExtend,
            difficulty,
            hand: side,
          },
        });
      }, 4000);
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  return (
    <div className="game-container">
      <PoseTracker
        mode="wipe"
        scenery={scenery}
        side={side}
        onWipeProgress={(ratio) => setWipeRatio(ratio)}
        onComplete={handleWipeComplete}
        onWristMove={(x, y) => eraseAt(x, y)}
        onRealtimeAngleUpdate={({ shoulder, elbow }) => {
          setShoulderFlex(shoulder);
          setElbowExtend(elbow);
        }}
      />

      {!gameCompleted ? (
        <div className="wipe-area">
          <img src={scenery} alt="Scenery" className="base-image" />
          <canvas ref={overlayRef} className="overlay-canvas" />
          <p className="progress-text">Progress: {Math.floor(wipeRatio * 100)}%</p>
        </div>
      ) : (
        <div className="scenery-container">
          <img src={scenery} alt="Scenery" className="scenery-image" />
          <p className="congratulations-text">🎉 Congratulations!</p>
        </div>
      )}
    </div>
  );
}
