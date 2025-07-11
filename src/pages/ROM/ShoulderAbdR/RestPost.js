// pages/ROM/ShoulderAbdL/RestPost.js
import React, { useEffect, useState } from 'react';
import './RestPost.css';
import PoseTracker from '../../../components/PoseTracker';
import { useNavigate } from 'react-router-dom';

const RestPost = () => {
  const navigate = useNavigate();
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    if (!hasSpoken) {
      const msg = new SpeechSynthesisUtterance(
        'Sit or stand. Let both arms rest by your sides naturally. Please keep the full arm in view.'
      );
      msg.lang = 'en-US';
      msg.pitch = 1.2;
      msg.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
      setHasSpoken(true);
    }
  }, [hasSpoken]);

  const handleRestConfirmed = () => {
    navigate('/rom/shoulder-abd-r/measure');
  };

  return (
    <div className="rest-post-container">
      <div className="camera-section">
        <PoseTracker
          side="right"
          mode="rest"
          onPoseReady={() => {}} // 語音改由 useEffect 播放
          onRestConfirmed={handleRestConfirmed}
        />
      </div>
      <div className="instruction-section">
        <img
          src="/neutral-position.png"
          alt="Neutral Pose"
          className="avatar-image"
        />
        <p className="instruction-text">
          Sit or stand. Let both arms rest by your sides naturally.
          <br />
          Please keep the full arm in view.
        </p>
      </div>
    </div>
  );
};

export default RestPost;
