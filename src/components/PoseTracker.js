// components/PoseTracker.js
import React, { useRef, useEffect } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const PoseTracker = ({
  onPoseReady,
  onAngleUpdate,
  side = 'left',
  mode = 'rest',
  onRestConfirmed,
  onRightWristMove,
  onRealtimeAngleUpdate,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const isPoseReadyRef = useRef(false);
  const triggeredRef = useRef(false);
  const maxElbowExtendRef = useRef({ left: 0, right: 0 });
  const maxShoulderFlexRef = useRef({ left: 0, right: 0 });

  useEffect(() => {
    const setup = async () => {
      const vision = await FilesetResolver.forVisionTasks('/wasm');

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/wasm/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });

      landmarkerRef.current = landmarker;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        video.width = video.videoWidth;
        video.height = video.videoHeight;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        animationRef.current = requestAnimationFrame(detectPose);
      };
    };

    const detectPose = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || !landmarkerRef.current || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(detectPose);
        return;
      }

      const ctx = canvas.getContext('2d');
      const results = await landmarkerRef.current.detectForVideo(video, performance.now());
      let landmarks = results?.landmarks?.[0];

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (landmarks && landmarks.length > 0) {
        landmarks = landmarks.map((pt) => ({ ...pt, x: 1 - pt.x }));

        if (mode === 'badminton') {
          const leftWrist = landmarks[15];
          const rightWrist = landmarks[16];
          const leftShoulder = landmarks[11];
          const rightShoulder = landmarks[12];
        
          let direction = 'none';
        
          const leftRaised = leftWrist.visibility > 0.5 && leftShoulder.visibility > 0.5 && leftWrist.y < leftShoulder.y;
          const rightRaised = rightWrist.visibility > 0.5 && rightShoulder.visibility > 0.5 && rightWrist.y < rightShoulder.y;
        
          const decideDirection = (wrist) => {
            if (wrist.x < 0.33) return 'left';
            else if (wrist.x > 0.66) return 'right';
            else return 'mid';
          };
        
          if (rightRaised) {
            direction = decideDirection(rightWrist);
          } else if (leftRaised) {
            direction = decideDirection(leftWrist);
          }
        
          if (direction !== 'none' && !triggeredRef.current) {
            triggeredRef.current = true;
            onPoseReady?.(direction);
        
            setTimeout(() => {
              triggeredRef.current = false;
            }, 2000); // 每 2 秒偵測一次
          }
        }                

        if (mode === 'wipe') {
          const wristIndex = side === 'right' ? 16 : 15;
          const wrist = landmarks[wristIndex];
          if (wrist.visibility > 0.5) {
            ctx.beginPath();
            ctx.arc(wrist.x * canvas.width, wrist.y * canvas.height, 10, 0, 2 * Math.PI);
            ctx.fillStyle = 'cyan';
            ctx.fill();

            if (onRightWristMove) {
              const relX = wrist.x;
              const relY = wrist.y;
              onRightWristMove(relX, relY);
            }
          }

          const shoulder = calculateShoulderFlexionAngle(landmarks, side);
          const elbow = calculateElbowExtensionAngle(landmarks, side);

          if (elbow > maxElbowExtendRef.current[side]) {
            maxElbowExtendRef.current[side] = elbow;
          }

          if (shoulder > maxShoulderFlexRef.current[side]) {
            maxShoulderFlexRef.current[side] = shoulder;
          }

          onRealtimeAngleUpdate?.({
            shoulder: maxShoulderFlexRef.current[side],
            elbow: maxElbowExtendRef.current[side],
          });

        } else if (mode === 'measure' || mode === 'rest') {
          const indices = [11, 12, 13, 14, 15, 16];
          for (const i of indices) {
            const { x, y, visibility } = landmarks[i];
            if (visibility > 0.5) {
              ctx.beginPath();
              ctx.arc(x * canvas.width, y * canvas.height, 6, 0, 2 * Math.PI);
              ctx.fillStyle = 'cyan';
              ctx.fill();
            }
          }
        } else {
          const indices = [15, 16];
          for (const i of indices) {
            const { x, y, visibility } = landmarks[i];
            if (visibility > 0.5) {
              ctx.beginPath();
              ctx.arc(x * canvas.width, y * canvas.height, 6, 0, 2 * Math.PI);
              ctx.fillStyle = 'cyan';
              ctx.fill();
            }
          }
        }

        const a = calculateVerticalAbductionAngle(landmarks, 'left');
        const b = calculateVerticalAbductionAngle(landmarks, 'right');

        if (onAngleUpdate) onAngleUpdate({ a, b });

        if (mode === 'rest') {
          const ready = checkRestPoseByVertical(landmarks, a, b);
          if (ready && !isPoseReadyRef.current) {
            isPoseReadyRef.current = true;
            onPoseReady?.();
            onRestConfirmed?.();
          }
        }

        if (mode === 'measure') {
          const shoulder = landmarks[side === 'left' ? 11 : 12];
          const elbow = landmarks[side === 'left' ? 13 : 14];
          const wrist = landmarks[side === 'left' ? 15 : 16];
          const hipL = landmarks[23];
          const hipR = landmarks[24];
        
          const p1 = [landmarks[11].x, landmarks[11].y, landmarks[11].z];
          const p2 = [(hipL.x + hipR.x) / 2, (hipL.y + hipR.y) / 2, (hipL.z + hipR.z) / 2];
          const p3 = [landmarks[12].x, landmarks[12].y, landmarks[12].z];
          const planeNormal = calculatePlaneNormal(p1, p2, p3);
          const upperArmVector = [
            elbow.x - shoulder.x,
            elbow.y - shoulder.y,
            elbow.z - shoulder.z,
          ];
          const angleToPlane = calculateAngleBetweenVectorAndPlane(upperArmVector, planeNormal);

          const shoulder_elbow_z_diff = Math.abs(shoulder.z - elbow.z);
          const shoulder_wrist_z_diff = Math.abs(shoulder.z - wrist.z);

          const elbow_angle = calculateElbowExtensionAngle(landmarks, side);
          const shoulder_abd_angle = calculateVerticalAbductionAngle(landmarks, side);

          const features = [
            elbow_angle,
            shoulder_abd_angle,
            angleToPlane,
            shoulder_elbow_z_diff,
            shoulder_wrist_z_diff,
          ].map((v) => (isNaN(v) || v === undefined ? 0 : v));
          onAngleUpdate?.({ a, b, landmarks, features });         
        } 
      }
      animationRef.current = requestAnimationFrame(detectPose);
    };

    setup();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [onPoseReady, onAngleUpdate, side, mode, onRestConfirmed, onRightWristMove, onRealtimeAngleUpdate]);

  return (
    <div
      className={`camera-wrapper ${mode}-mode`}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <video
        ref={videoRef}
        className={mode === 'measure' || mode === 'rest' ? 'pose-video' : 'pose-video hidden'}
        muted
        playsInline
        autoPlay
      />
      <canvas
        ref={canvasRef}
        className="pose-canvas"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
};

function calculateVerticalAbductionAngle(landmarks, side = 'left') {
  const isRight = side === 'right';
  const shoulder = landmarks[isRight ? 12 : 11];
  const elbow = landmarks[isRight ? 14 : 13];
  const dx = elbow.x - shoulder.x;
  const dy = elbow.y - shoulder.y;
  const angle = Math.atan2(dx, dy) * (180 / Math.PI);
  return Math.abs(angle);
}

function calculateShoulderFlexionAngle(landmarks, side = 'right') {
  const isRight = side === 'right';
  const shoulder = landmarks[isRight ? 12 : 11];
  const elbow = landmarks[isRight ? 14 : 13];
  const upperArm = [
    elbow.x - shoulder.x,
    elbow.y - shoulder.y,
    elbow.z - shoulder.z,
  ];
  const vertical = [0, 1, 0];  // Y 軸朝下，因為 Mediapipe 的 y 軸向下是正方向
  const dot = upperArm[0]*vertical[0] + upperArm[1]*vertical[1] + upperArm[2]*vertical[2];
  const len1 = Math.sqrt(upperArm[0]**2 + upperArm[1]**2 + upperArm[2]**2);
  const len2 = Math.sqrt(vertical[0]**2 + vertical[1]**2 + vertical[2]**2);
  const angleRad = Math.acos(dot / (len1 * len2));
  const angleDeg = angleRad * (180 / Math.PI);
  return angleDeg; // 0 = 垂手下垂，90 = 向前舉平，180 = 舉過頭
}

function calculateElbowExtensionAngle(landmarks, side = 'right') {
  const shoulder = landmarks[side === 'right' ? 12 : 11];
  const elbow = landmarks[side === 'right' ? 14 : 13];
  const wrist = landmarks[side === 'right' ? 16 : 15];
  const vec1 = [shoulder.x - elbow.x, shoulder.y - elbow.y];
  const vec2 = [wrist.x - elbow.x, wrist.y - elbow.y];
  const dot = vec1[0] * vec2[0] + vec1[1] * vec2[1];
  const len1 = Math.sqrt(vec1[0] ** 2 + vec1[1] ** 2);
  const len2 = Math.sqrt(vec2[0] ** 2 + vec2[1] ** 2);
  const angle = Math.acos(dot / (len1 * len2)) * (180 / Math.PI);
  return angle;
}

function checkRestPoseByVertical(landmarks, angleL, angleR) {
  const points = [11, 13, 15, 12, 14, 16];
  const allVisible = points.every((i) => landmarks[i]?.visibility > 0.5);
  return allVisible && angleL < 10 && angleR < 10;
}

function calculateAngleBetweenVectorAndPlane(v, normal) {
  const dot = v[0]*normal[0] + v[1]*normal[1] + v[2]*normal[2];
  const normV = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
  const normN = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
  const angle = Math.acos(dot / (normV * normN)) * (180 / Math.PI);
  return Math.abs(90 - angle);
}

function calculatePlaneNormal(p1, p2, p3) {
  const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
  const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
  return [
    v1[1]*v2[2] - v1[2]*v2[1],
    v1[2]*v2[0] - v1[0]*v2[2],
    v1[0]*v2[1] - v1[1]*v2[0],
  ];
}

export default PoseTracker;
