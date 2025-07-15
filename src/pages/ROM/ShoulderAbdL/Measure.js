// pages/ROM/ShoulderAbdL/Measure.js
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
  const [finalAngle, setFinalAngle] = useState(null); // ❗ 固定的角度結果
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

  const handleAngleUpdate = ({ a, landmarks }) => {
    if (showResult) return;
  
    // const correct = isPoseCorrect(landmarks, 'left');
  
    // if (!correct) {
    //   if (!hasSpoken) {
    //     const msg = new SpeechSynthesisUtterance(
    //       'Please raise your arm to the side and keep your elbow straight.'
    //     );
    //     msg.lang = 'en-US';
    //     msg.pitch = 1.2;
    //     msg.rate = 0.95;
    //     window.speechSynthesis.cancel();
    //     window.speechSynthesis.speak(msg);
    //     setHasSpoken(true);
  
    //     setTimeout(() => {
    //       setHasSpoken(false); // 讓提示可以再次播放
    //     }, 5000);
    //   }
    //   setStableStart(null);
    //   setCountdown(null);
    //   return;
    // }
  
    if (a > maxAngle) setMaxAngle(a);
  
    const isHolding = a > 10;
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
          setFinalAngle(maxAngle);
          setShowResult(true);
          setCountdown(null);
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
      const romCollection = collection(db, 'users', user.uid, 'romMeasurements', 'shoulder-abd-l', 'records');
      await addDoc(romCollection, {
        angle: finalAngle,
        timestamp: serverTimestamp()
      });
      console.log('Angle saved to Firestore under shoulder-abd-l');
    } catch (error) {
      console.error('Error saving angle:', error);
    }
  };

  const handleNext = async () => {
    await saveAngleToFirestore();
    navigate('/rom/shoulder-abd-r/rest');
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
            <div className="angle-result">{finalAngle?.toFixed(1)}°</div>
            <div className="button-group">
              <button onClick={() => window.location.reload()}>Test again</button>
              <button onClick={handleNext}>Next</button>
            </div>
          </>
        ) : (
          <>
            <model-viewer
              src="/models/shoulder-abd-l.glb"
              alt="Shoulder Abduction"
              autoplay
              animation-name="ArmRaise"
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

function isPoseCorrect(landmarks, side = 'left') {
  if (!landmarks || landmarks.length < 17) return false; // ✅ 防止 undefined 或長度不足
  const shoulder = landmarks[side === 'left' ? 11 : 12];
  const elbow = landmarks[side === 'left' ? 13 : 14];
  const wrist = landmarks[side === 'left' ? 15 : 16];

  // 判斷手肘是否幾乎打直（大於120° 視為打直）
  const elbowAngle = calculateElbowExtensionAngle(landmarks, side);
  const isElbowStraight = elbowAngle > 120;

  // ✅ 判斷是否是往側邊抬（z 軸深度差距小表示不是往前或往後抬）
  const depthDiff = Math.abs(wrist.z - shoulder.z); // ✅ z 越接近越正確
  const isSideLifted = depthDiff < 0.15; // ✅ 門檻值你可以根據實測微調

  return isElbowStraight && isSideLifted;
}

function calculateElbowExtensionAngle(landmarks, side = 'left') {
  const shoulder = landmarks[side === 'left' ? 11 : 12];
  const elbow = landmarks[side === 'left' ? 13 : 14];
  const wrist = landmarks[side === 'left' ? 15 : 16];
  const vec1 = [shoulder.x - elbow.x, shoulder.y - elbow.y];
  const vec2 = [wrist.x - elbow.x, wrist.y - elbow.y];
  const dot = vec1[0] * vec2[0] + vec1[1] * vec2[1];
  const len1 = Math.sqrt(vec1[0] ** 2 + vec1[1] ** 2);
  const len2 = Math.sqrt(vec2[0] ** 2 + vec2[1] ** 2);
  const angle = Math.acos(dot / (len1 * len2)) * (180 / Math.PI);
  return angle;
}

export default Measure;
