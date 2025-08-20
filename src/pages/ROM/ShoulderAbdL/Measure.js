// pages/ROM/ShoulderAbdL/Measure.js
import React, { useEffect, useState } from 'react';
import './Measure.css';
import PoseTracker from '../../../components/PoseTracker';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Measure = () => {
  const [hasSpoken, setHasSpoken] = useState(false);   // Track if voice instruction has been played
  const [maxAngle, setMaxAngle] = useState(0);         // Highest angle recorded during movement
  const [stableStart, setStableStart] = useState(null); // Timestamp when stable holding starts
  const [countdown, setCountdown] = useState(null);     // Countdown (3 → 0) for stable holding
  const [showResult, setShowResult] = useState(false);  // Whether to show the result screen
  const [finalAngle, setFinalAngle] = useState(null);   // Final measured maximum angle
  const [stableAngle, setStableAngle] = useState(null); // Angle at the moment stability is confirmed
  const [poseCorrect, setPoseCorrect] = useState(false); // Whether the pose is predicted correct (ML output)
  const [showWarnings, setShowWarnings] = useState(false); // Whether to display posture warnings
  const [isFinalized, setIsFinalized] = useState(false);   // Prevents multiple finalizations
  const navigate = useNavigate();

  // Show warning after 3 seconds
  useEffect(() => {
    if (!hasSpoken) {
      const msg = new SpeechSynthesisUtterance(
        'Raise your left arm outward as high as possible without pain, and hold it for 3 seconds.'
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
    const timer = setTimeout(() => setShowWarnings(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleAngleUpdate = async ({ a, landmarks, features }) => {
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
  
    if (a > maxAngle) setMaxAngle(a); // Track maximum angle reached
  
    const isHolding = a > 10; // Check if user is holding the arm above 10° and stable
    const isStable = Math.abs(a - maxAngle) < 20; // Check if the arm angle is stable
  
    if (isHolding && isStable) {
      if (!stableStart) {
        setStableStart(Date.now());
        setCountdown(3);
      } else {
        const elapsed = (Date.now() - stableStart) / 1000; // Calculate elapsed stable time
        const newCountdown = Math.ceil(3 - elapsed);
        if (newCountdown !== countdown) { // Update countdown overlay
          setCountdown(newCountdown > 0 ? newCountdown : null);
        }
  
        if (elapsed >= 3) { // If held for 3 seconds, finalize result
          setFinalAngle(maxAngle);
          setShowResult(true);
          setCountdown(null);
          setStableAngle(a);
          setIsFinalized(true);
          return;
        }
      }
    } else { // Reset if user drops arm or becomes unstable
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
  
    try { // Save under path: users/{uid}/romMeasurements/shoulder-abd-l/records
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

export default Measure;
