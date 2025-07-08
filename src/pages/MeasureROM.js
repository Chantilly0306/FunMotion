// MeasureROM.js
import React, { useState, useEffect } from 'react';
import './MeasureROM.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import PoseTracker from '../components/PoseTracker';

const AnimatedAvatar = ({ url }) => {
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (animations.length > 0) {
      actions[animations[0].name]?.play();
    }
  }, [actions, animations]);

  return <primitive object={scene} scale={1.5} />;
};

const MeasureROM = () => {
  const [angle, setAngle] = useState(0);
  const [maxAngle, setMaxAngle] = useState(0);
  const [poseReady, setPoseReady] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [angleHistory, setAngleHistory] = useState([]);

  useEffect(() => {
    if (poseReady && !audioPlayed) {
      const audio = new SpeechSynthesisUtterance(
        'Keep your palm facing forward. Raise your left arm outward as high as possible without pain, and hold it for 3 seconds.'
      );
      window.speechSynthesis.speak(audio);
      setAudioPlayed(true);
    }
  }, [poseReady, audioPlayed]);

  useEffect(() => {
    if (countdown === 0) {
      setShowResult(true);
    } else if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleAngleUpdate = (newAngle) => {
    setAngle(newAngle);
    setAngleHistory((prev) => [...prev, newAngle]);
    setMaxAngle((prev) => (newAngle > prev ? newAngle : prev));

    if (!poseReady && newAngle < 20) {
      setPoseReady(true);
    }

    if (poseReady && newAngle > 30 && countdown === null) {
      setCountdown(3);
    }
  };

  return (
    <div className="measure-rom-container">
      <div className="camera-section">
        <PoseTracker side="left" onAngleUpdate={handleAngleUpdate} />
      </div>

      <div className="avatar-section">
        {!poseReady && (
          <>
            <img
              src="/neutral-position.png"
              alt="Neutral Pose"
              className="avatar-image"
            />
            <p className="instruction-text">
              Sit or stand. Let both arms rest by your sides naturally.
            </p>
          </>
        )}

        {poseReady && !showResult && (
          <>
            <div className="avatar-animation">
              <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[3, 3, 3]} />
                <AnimatedAvatar url="/models/shoulder-abd-l.glb" />
                <OrbitControls enableZoom={false} />
              </Canvas>
            </div>
            <p className="instruction-text">
              Keep your palm facing forward. Raise your left arm outward as high as possible without pain, and hold it for 3 seconds.
            </p>
            {countdown !== null && (
              <p className="instruction-text">Hold... {countdown}</p>
            )}
          </>
        )}

        {showResult && (
          <div className="result-box">
            <p className="result-text">Max Angle Recorded: {maxAngle}°</p>
            <div className="button-group">
              <button onClick={() => window.location.reload()}>Retake</button>
              <button onClick={() => alert('Proceeding to next step...')}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasureROM;
