// src/components/BadmintonGameScene.js
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer } from 'three';

const BadmintonGameScene = () => {
  const mountRef = useRef(null);
  const [currentModel, setCurrentModel] = useState(null);
  const modelViewerRef = useRef(null);

  const animationFiles = [
    // 'left-to-left.glb',
    // 'left-to-mid.glb',
    // 'left-to-right.glb',
    // 'mid-to-left.glb',
    'mid-to-mid.glb',
    // 'mid-to-right.glb',
    // 'right-to-left.glb',
    // 'right-to-mid.glb',
    // 'right-to-right.glb'
  ];

  const playNextModel = () => {
    const randomIndex = Math.floor(Math.random() * animationFiles.length);
    const fileName = animationFiles[randomIndex];
    setCurrentModel(null);
  
    setTimeout(() => {
      setCurrentModel(`/models/${fileName}`);
    }, 100);
  };  

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(14, 3, 0);
    camera.lookAt(0, 1.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
    scene.add(hemiLight);

    const loader = new GLTFLoader();
    loader.load('/models/badminton-court.glb', (gltf) => {
      scene.add(gltf.scene);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    const handleFinished = () => {
      playNextModel();
    };

    viewer.addEventListener('finished', handleFinished);
    playNextModel();

    return () => {
      viewer.removeEventListener('finished', handleFinished);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />
  
      <model-viewer
        key={currentModel}
        ref={modelViewerRef}
        src={currentModel}
        autoplay
        camera-controls
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
        exposure="1"
        disable-zoom
        disable-pan
        disable-tap
        shadow-intensity="1"
        animation-name="Animation"
      />
  
      <model-viewer
        src="/models/badminton-racket.glb"
        autoplay
        camera-controls
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
        camera-orbit="10deg 75deg 2m"
        disable-zoom
        disable-pan
        disable-tap
        shadow-intensity="1"
      />
    </div>
  );  
};

export default BadmintonGameScene;
