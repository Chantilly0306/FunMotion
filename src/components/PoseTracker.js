// components/PoseTracker.js
import React, { useRef, useEffect } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const PoseTracker = ({
  onPoseReady,
  onAngleUpdate,
  side = 'left',
  mode = 'rest',
  onRestConfirmed,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const isPoseReadyRef = useRef(false);

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

      if (!video || !landmarkerRef.current || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(detectPose);
        return;
      }

      const results = await landmarkerRef.current.detectForVideo(video, performance.now());
      let landmarks = results?.landmarks?.[0];

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (landmarks && landmarks.length > 0) {
        // ✅ 鏡像 x 座標（與畫面鏡像一致）
        landmarks = landmarks.map((pt) => ({ ...pt, x: 1 - pt.x }));

        for (let i = 11; i <= 16; i++) {
          const { x, y, visibility } = landmarks[i];
          if (visibility > 0.5) {
            ctx.beginPath();
            ctx.arc(x * canvas.width, y * canvas.height, 6, 0, 2 * Math.PI);
            ctx.fillStyle = 'cyan';
            ctx.fill();
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
          const c = calculateVerticalAbductionAngle(landmarks, 'left');
          onAngleUpdate?.({ a: c });
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
    };
  }, [onPoseReady, onAngleUpdate, side, mode, onRestConfirmed]);

  return (
    <div className="camera-wrapper">
      <video ref={videoRef} className="pose-video" muted playsInline />
      <canvas ref={canvasRef} className="pose-canvas" />
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

function checkRestPoseByVertical(landmarks, angleL, angleR) {
  const points = [11, 13, 15, 12, 14, 16];
  const allVisible = points.every((i) => landmarks[i]?.visibility > 0.5);
  return allVisible && angleL < 20 && angleR < 20;
}

export default PoseTracker;
