// pages/ROM/ShoulderAbdL/Measure.js
import React, { useEffect, useState } from 'react';
import './Measure.css';
import PoseTracker from '../../../components/PoseTracker';
import { useNavigate } from 'react-router-dom';

const Measure = () => {
  const [hasSpoken, setHasSpoken] = useState(false);
  const [maxAngle, setMaxAngle] = useState(0);
  const [stableStart, setStableStart] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasSpoken) {
      const msg = new SpeechSynthesisUtterance(
        'Raise your left arm outward as high as possible without pain, and hold it for 3 seconds.'
      );
      msg.lang = 'en-US';
      msg.pitch = 1.2;
      msg.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
      setHasSpoken(true);
    }
  }, [hasSpoken]);

  const handleAngleUpdate = ({ a }) => {
    if (a > maxAngle) setMaxAngle(a);

    const isHolding = a > 20;
    const isStable = Math.abs(a - maxAngle) < 20;

    if (isHolding && isStable) {
      if (!stableStart) {
        setStableStart(Date.now());
        setCountdown(3);
      } else {
        const elapsed = (Date.now() - stableStart) / 1000;
        const timeLeft = Math.ceil(3 - elapsed);
        setCountdown(timeLeft > 0 ? timeLeft : null);

        if (elapsed >= 3) {
          setShowResult(true);
          setCountdown(null);
        }
      }
    } else {
      setStableStart(null);
      setCountdown(null);
    }
  };

  return (
    <div className="measure-post-container">
      <div className="camera-section">
        <PoseTracker
          side="left"
          mode="measure"
          onAngleUpdate={handleAngleUpdate}
        />
        {countdown !== null && !showResult && (
          <div className="countdown-overlay">{countdown}</div>
        )}
      </div>
      <div className="instruction-section">
        {showResult ? (
          <>
            <h2 className="result-title">Your maximum angle</h2>
            <div className="angle-result">{maxAngle.toFixed(1)}°</div>
            <div className="button-group">
              <button onClick={() => window.location.reload()}>Test again</button>
              <button onClick={() => navigate('/rom/shoulder-abd-r/rest')}>Next</button>
            </div>
          </>
        ) : (
          <>
            <model-viewer
              src="/models/shoulder-abd-l.glb"
              alt="Shoulder Abduction"
              auto-rotate
              camera-controls
              style={{ width: '100%', height: '400px' }}
            />
            <p className="instruction-text">
              Keep your palm facing forward.
              <br />
              Raise your left arm outward as high as possible without pain,
              <br />
              and hold it for 3 seconds.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Measure;
