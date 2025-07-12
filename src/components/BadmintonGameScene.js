// src/components/BadmintonGameScene.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {
  GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader';
import {
  AnimationMixer,
  AnimationClip,
  VectorKeyframeTrack
} from 'three';

const BadmintonGameScene = ({ onShuttleHit, expectedDirection, wristPosition }) => {
  const mountRef = useRef(null);
  const shuttlecockRef = useRef(null);
  const racketRef = useRef(null);
  const directionRef = useRef('center');
  const wristRef = useRef(null);

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

    // 羽球（含動畫）
    loader.load('/models/badminton.glb', (gltf) => {
      const shuttle = gltf.scene;
      shuttle.scale.set(15, 15, 15);
      shuttle.position.set(-5, 3, 0);
      scene.add(shuttle);
      shuttlecockRef.current = shuttle;

      const dir = expectedDirection || ['left', 'center', 'right'][Math.floor(Math.random() * 3)];
      directionRef.current = dir;
      const zOffset = { left: -2, center: 0, right: 2 }[dir];

      // 用 KeyframeTrack 定義位置動畫
      const positionKF = new VectorKeyframeTrack(
        '.position',
        [0, 2],
        [-5, 3, 0, 13, 2, zOffset]
      );
      const clip = new AnimationClip('fly', 2, [positionKF]);
      const mixer = new AnimationMixer(shuttle);
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.play();

      shuttle.userData.mixer = mixer;

      // 加邊界線 debug
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

      // 球拍移動
      const pos = wristRef.current;
      if (pos && racketRef.current) {
        const { x, y } = pos;
        const mappedZ = (x - 0.5) * 6;
        const mappedY = (1 - y) * 3;
        racketRef.current.position.set(13.8, mappedY, mappedZ);
        racketRef.current.rotation.set(0, Math.PI / 2, 0);
      }

      // 更新羽球動畫
      const shuttle = shuttlecockRef.current;
      if (shuttle?.userData.mixer) {
        shuttle.userData.mixer.update(delta);
        shuttle.userData.boxHelper?.update();

        // 碰撞偵測
        if (racketRef.current) {
          const racketBox = new THREE.Box3().setFromObject(racketRef.current);
          const shuttleBox = new THREE.Box3().setFromObject(shuttle);
          if (racketBox.intersectsBox(shuttleBox)) {
            onShuttleHit?.(directionRef.current);
            shuttle.userData.mixer.stopAllAction();
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
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
