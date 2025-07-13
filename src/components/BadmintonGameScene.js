// src/components/BadmintonGameScene.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer } from 'three';

const BadmintonGameScene = ({ onShuttleHit, expectedDirection, wristPosition }) => {
  const mountRef = useRef(null);
  const shuttlecockRef = useRef(null);
  const racketRef = useRef(null);
  const directionRef = useRef('center');
  const wristRef = useRef(null);
  const mixerRef = useRef(null);
  const animationsRef = useRef([]);
  const currentActionRef = useRef(null);

  useEffect(() => {
    wristRef.current = wristPosition;
  }, [wristPosition]);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(14, 3, 0);
    camera.lookAt(0, 1.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current && mountRef.current.appendChild(renderer.domElement);

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    const loader = new GLTFLoader();

    // 球場
    loader.load('/models/badminton-court.glb', (gltf) => {
      scene.add(gltf.scene);
    });

    // 羽球 + 所有動畫
    loader.load('/models/badminton-action.glb', (gltf) => {
      const shuttle = gltf.scene;
      shuttle.scale.set(1, 1, 1);
      scene.add(shuttle);
      shuttlecockRef.current = shuttle;

      const mixer = new AnimationMixer(shuttle);
      mixerRef.current = mixer;
      animationsRef.current = gltf.animations;

      const playRandomAnimation = () => {
        const clips = animationsRef.current;
        if (!clips || clips.length === 0) return;

        const randomIndex = Math.floor(Math.random() * clips.length);
        const clip = clips[randomIndex];
        const action = mixer.clipAction(clip);
        action.reset();
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.play();

        currentActionRef.current = action;

        action.onFinished = () => {
          playRandomAnimation(); // 播完繼續播下一個
        };
      };

      playRandomAnimation();

      // 加邊界線 debug（可選）
      const boxHelper = new THREE.BoxHelper(shuttle, 0xffff00);
      scene.add(boxHelper);
      shuttle.userData.boxHelper = boxHelper;
    });

    // 球拍
    loader.load('/models/badminton-racket.glb', (gltf) => {
      const racket = gltf.scene;
      racket.scale.set(0.5, 0.5, 0.5);
      scene.add(racket);
      racketRef.current = racket;
    });

    // 動畫更新
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      const pos = wristRef.current;
      if (pos && racketRef.current) {
        const { x, y } = pos;
        const mappedZ = (x - 0.5) * 6;
        const mappedY = (1 - y) * 3;
        racketRef.current.position.set(13.8, mappedY, mappedZ);
        racketRef.current.rotation.set(0, Math.PI / 2, 0);
      }

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      const shuttle = shuttlecockRef.current;
      if (shuttle?.userData.boxHelper) {
        shuttle.userData.boxHelper.update();

        if (racketRef.current) {
          const racketBox = new THREE.Box3().setFromObject(racketRef.current);
          const shuttleBox = new THREE.Box3().setFromObject(shuttle);
          if (racketBox.intersectsBox(shuttleBox)) {
            onShuttleHit?.(directionRef.current);
            currentActionRef.current?.stop(); // 若碰到就停動畫
          }
        }
      }

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

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default BadmintonGameScene;
