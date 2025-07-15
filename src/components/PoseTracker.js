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

  // 儲存左右手最大 elbow extension 角度
  const maxElbowExtendRef = useRef({ left: 0, right: 0 });
  const maxShoulderFlexRef = useRef({ left: 0, right: 0 });

  useEffect(() => {
    const setup = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      );

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/pose_landmarker_lite.task',
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
      // if (!landmarks || landmarks.length < 17) {
      //   animationRef.current = requestAnimationFrame(detectPose);
      //   return;
      // }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (landmarks && landmarks.length > 0) {
        landmarks = landmarks.map((pt) => ({ ...pt, x: 1 - pt.x }));

        if (mode === 'badminton') {
          const rightWrist = landmarks[16];
          const rightShoulder = landmarks[12];
        
          if (rightWrist.visibility > 0.5 && rightShoulder.visibility > 0.5) {
            const isRaised = rightWrist.y < rightShoulder.y;
            let direction = 'none';
        
            if (isRaised) {
              if (rightWrist.x < 0.33) {
                direction = 'left';
              } else if (rightWrist.x > 0.66) {
                direction = 'right';
              } else {
                direction = 'center';
              }
            }
        
            if (direction !== 'none' && !triggeredRef.current) {
              triggeredRef.current = true;
              onPoseReady?.(direction);
        
              setTimeout(() => {
                triggeredRef.current = false;
              }, 2000); // 每 2 秒允許一次偵測
            }
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

          const flex = calculateShoulderFlexionAngle(landmarks, side);
          const elbow = calculateElbowExtensionAngle(landmarks, side);

          if (elbow > maxElbowExtendRef.current[side]) {
            maxElbowExtendRef.current[side] = elbow;
          }

          if (flex > maxShoulderFlexRef.current[side]) {
            maxShoulderFlexRef.current[side] = flex;
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
          const indices = [12, 14, 16];
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
          const angle = calculateVerticalAbductionAngle(landmarks, side);
          if (side === 'left') {
            onAngleUpdate?.({ a: angle, landmarks });
          } else {
            onAngleUpdate?.({ b: angle, landmarks });
          }
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
  const hip = landmarks[isRight ? 24 : 23];
  const vec1 = [
    hip.x - shoulder.x,
    hip.y - shoulder.y,
    hip.z - shoulder.z,
  ];

  const vec2 = [
    shoulder.x - elbow.x,
    shoulder.y - elbow.y,
    shoulder.z - elbow.z,
  ];

  const dot = vec1[0]*vec2[0] + vec1[1]*vec2[1] + vec1[2]*vec2[2];
  const len1 = Math.sqrt(vec1[0]**2 + vec1[1]**2 + vec1[2]**2);
  const len2 = Math.sqrt(vec2[0]**2 + vec2[1]**2 + vec2[2]**2);
  const angleRad = Math.acos(dot / (len1 * len2));
  const angleDeg = angleRad * (180 / Math.PI);
  return angleDeg;
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

export default PoseTracker;
