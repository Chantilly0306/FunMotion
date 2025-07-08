// PoseTracker.js
import React, { useEffect, useRef } from 'react';
import {
  FilesetResolver,
  PoseLandmarker,
  DrawingUtils,
} from '@mediapipe/tasks-vision';

const PoseTracker = ({ side = 'left', onAngleUpdate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );

        const detector = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });

        detectorRef.current = detector;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
            advanced: [{ fieldOfView: 90 }],
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            requestAnimationFrame(predictFrame);
          };
        }
      } catch (error) {
        console.error('Failed to initialize pose detector:', error);
      }
    };

    const predictFrame = async () => {
      if (
        !videoRef.current ||
        videoRef.current.readyState < 2 ||
        !detectorRef.current
      ) {
        animationFrameRef.current = requestAnimationFrame(predictFrame);
        return;
      }

      const results = await detectorRef.current.detectForVideo(
        videoRef.current,
        performance.now()
      );

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Mirror the canvas horizontally
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      ctx.restore();

      if (results.landmarks && results.landmarks.length > 0) {
        const drawingUtils = new DrawingUtils(ctx);

        // Draw again after canvas reset
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);

        drawingUtils.drawLandmarks(results.landmarks[0]);
        drawingUtils.drawConnectors(results.landmarks[0]);

        ctx.restore();

        const angle = calculateShoulderAbduction(results.landmarks[0], side);
        if (onAngleUpdate) onAngleUpdate(angle);
      }

      animationFrameRef.current = requestAnimationFrame(predictFrame);
    };

    init();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [side, onAngleUpdate]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)', // mirror the video
        }}
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

function calculateShoulderAbduction(landmarks, side = 'left') {
  const isRight = side === 'right';
  const shoulder = landmarks[isRight ? 12 : 11];
  const elbow = landmarks[isRight ? 14 : 13];
  const hip = landmarks[isRight ? 24 : 23];

  const vec1 = {
    x: elbow.x - shoulder.x,
    y: elbow.y - shoulder.y,
    z: elbow.z - shoulder.z,
  };
  const vec2 = {
    x: shoulder.x - hip.x,
    y: shoulder.y - hip.y,
    z: shoulder.z - hip.z,
  };

  const dot = vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
  const mag1 = Math.sqrt(vec1.x ** 2 + vec1.y ** 2 + vec1.z ** 2);
  const mag2 = Math.sqrt(vec2.x ** 2 + vec2.y ** 2 + vec2.z ** 2);
  const angleRad = Math.acos(dot / (mag1 * mag2));
  return Math.round((angleRad * 180) / Math.PI);
}

export default PoseTracker;
