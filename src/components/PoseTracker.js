import React, { useRef, useEffect } from 'react';
import { Pose } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import Webcam from 'react-webcam';

const PoseTracker = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (!canvasRef.current || !webcamRef.current) return;

      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      canvasCtx.drawImage(
        results.image, 0, 0, canvasRef.current.width, canvasRef.current.height
      );

      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, Pose.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1 });
      }
    });

    const interval = setInterval(() => {
      if (
        typeof webcamRef.current !== 'undefined' &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        pose.send({ image: webcamRef.current.video });
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative', width: 640, height: 480 }}>
      <Webcam
        ref={webcamRef}
        style={{
          position: 'absolute',
          width: 640,
          height: 480,
          visibility: 'hidden'
        }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          position: 'absolute',
          left: 0,
          top: 0
        }}
      />
    </div>
  );
};

export default PoseTracker;
