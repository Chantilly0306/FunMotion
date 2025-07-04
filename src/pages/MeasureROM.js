import React, { useEffect, useState } from 'react';
import './MeasureROM.css';
import Lottie from 'lottie-react';
import shoulderAbductionAnimation from './shoulder-abduction-animation.json'; // Lottie animation file

const MeasureROM = () => {
  const [side, setSide] = useState('right'); // 'left' or 'right'
  const [angle, setAngle] = useState(0);
  const [maxAngle, setMaxAngle] = useState(0);
  const [stableCounter, setStableCounter] = useState(0);

  useEffect(() => {
    // Placeholder: Simulate angle updates from PoseTracker
    const interval = setInterval(() => {
      const simulatedAngle = Math.floor(Math.random() * 90 + 90); // Random 90~180 degrees
      setAngle(simulatedAngle);
      setMaxAngle(prev => (simulatedAngle > prev ? simulatedAngle : prev));

      if (simulatedAngle >= maxAngle - 5) {
        setStableCounter(prev => prev + 1);
      } else {
        setStableCounter(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [maxAngle]);

  return (
    <div className="rom-container">
      <h1 className="rom-title">Shoulder Abduction Measurement</h1>
      <p className="rom-instruction">
        Please move your {side} arm to the maximum range without pain.<br />
        Hold the position for 3 seconds.
      </p>

      <div className="rom-animation">
        <Lottie animationData={shoulderAbductionAnimation} loop autoplay style={{ width: 250 }} />
      </div>

      <div className="rom-info">
        <p>Side: <strong>{side.toUpperCase()}</strong></p>
        <p>Current Angle: <strong>{angle}°</strong></p>
        <p>Max Angle: <strong>{maxAngle}°</strong></p>
        {stableCounter >= 3 && <p className="rom-success">✔️ Angle held for 3 seconds!</p>}
      </div>
    </div>
  );
};

export default MeasureROM;
