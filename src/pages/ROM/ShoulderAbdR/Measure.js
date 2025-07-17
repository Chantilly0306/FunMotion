// pages/ROM/ShoulderAbdR/Measure.js
import React, { useEffect, useState } from 'react';
import './Measure.css';
import PoseTracker from '../../../components/PoseTracker';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Measure = () => {
  const [hasSpoken, setHasSpoken] = useState(false);
  const [maxAngle, setMaxAngle] = useState(0);
  const [stableStart, setStableStart] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [finalAngle, setFinalAngle] = useState(null);
  const [stableAngle, setStableAngle] = useState(null);
  const [poseCorrect, setPoseCorrect] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasSpoken) {
      const msg = new SpeechSynthesisUtterance(
        'Raise your right arm outward as high as possible without pain, and hold it for 3 seconds.'
      );
      msg.lang = 'en-GB';
      msg.pitch = 1.4;
      msg.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
      setHasSpoken(true);
    }
  }, [hasSpoken]);

  useEffect(() => {
    const timer = setTimeout(() => setShowWarnings(true), 3000); // 3 秒後才允許顯示警告
    return () => clearTimeout(timer);
  }, []);

  const handleAngleUpdate = async ({ b, landmarks, features }) => {
    if (showResult || isFinalized) return;

    // try {
    //   const response = await fetch(`${process.env.REACT_APP_API_URL}/predict`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ features }),
    //   });

    //   const data = await response.json();
    //   const correct = data.correctness;
    //   setPoseCorrect(correct);

    //   console.log("Features sent:", features);
    //   console.log("Pose correctness:", correct);

    // } catch (error) {
    //   console.error('Error calling prediction API:', error);
    // }

    if (b > maxAngle) setMaxAngle(b);

    const isHolding = b > 10;
    const isStable = Math.abs(b - maxAngle) < 20;

    if (isHolding && isStable) {
      if (!stableStart) {
        setStableStart(Date.now());
        setCountdown(3);
      } else {
        const elapsed = (Date.now() - stableStart) / 1000;
        const newCountdown = Math.ceil(3 - elapsed);
        if (newCountdown !== countdown) {
          setCountdown(newCountdown > 0 ? newCountdown : null);
        }

        if (elapsed >= 3) {
          setFinalAngle(maxAngle);
          setShowResult(true);
          setCountdown(null);
          setStableAngle(b); // 每次符合條件就更新穩定基準角度
          setIsFinalized(true);
          return;
        }
      }
    } else {
      setStableStart(null);
      setCountdown(null);
    }
  };

  const saveAngleToFirestore = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.warn('User not logged in');
      return;
    }

    try {
      const romCollection = collection(db, 'users', user.uid, 'romMeasurements', 'shoulder-abd-r', 'records');
      await addDoc(romCollection, {
        angle: finalAngle,
        timestamp: serverTimestamp()
      });
      console.log('Angle saved to Firestore under shoulder-abd-r');
    } catch (error) {
      console.error('Error saving angle:', error);
    }
  };

  const handleNext = async () => {
    await saveAngleToFirestore();
    navigate('/dashboard');
  };

  return (
    <div className="measure-post-container">
      <div className="camera-section">
        <PoseTracker
          side="right"
          mode="measure"
          onAngleUpdate={handleAngleUpdate}
        />
        {countdown !== null && !showResult && (
          <div className="countdown-overlay">{countdown}</div>
        )}
        {!poseCorrect && !showResult && showWarnings && (
          <div className="pose-warning">Please raise your arm to the side<br />and keep your elbow straight.</div>
        )}
      </div>
      <div className="instruction-section">
        {showResult ? (
          <>
            <h2 className="result-title">Your maximum angle</h2>
            <div className="angle-result">{finalAngle?.toFixed(1)}°</div>
            <div className="button-group">
              <button onClick={() => window.location.reload()}>Test again</button>
              <button onClick={handleNext}>Saved</button>
            </div>
          </>
        ) : (
          <>
            <model-viewer
              src="/models/shoulder-abd-r.glb"
              alt="Shoulder Abduction Right"
              autoplay
              animation-name="ShoulderAbdL"
              camera-controls
              reveal="auto"
              camera-orbit="0deg 85deg 3.5m"
              field-of-view="30deg"
              disable-zoom
              disable-pan
              disable-tap
              style={{ width: '100%', height: '100%' }}
            />
            <p className="instruction-text">
              Raise your right arm outward as high as possible without pain,
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
