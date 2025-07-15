// src/components/BadmintonGameScene.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer } from 'three';

const BadmintonGameScene = ({ onShuttleHit, expectedDirection, wristPosition }) => {
  const mountRef = useRef(null);              // 放置渲染器的 DOM 位置
  const shuttlecockRef = useRef(null);        // 羽球的 3D 模型
  const racketRef = useRef(null);             // 球拍的 3D 模型
  const directionRef = useRef('center');      // 預期方向（尚未實作）
  const wristRef = useRef(null);              // 手腕座標
  const mixerRef = useRef(null);              // Three.js 動畫混合器
  const animationsRef = useRef([]);           // 所有動畫
  const currentActionRef = useRef(null);      // 當前動畫 action

// 當外部傳入的 wristPosition 更新時，也更新內部 wristRef 的值
  useEffect(() => {
    wristRef.current = wristPosition;
  }, [wristPosition]);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // 黑色背景

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(14, 3, 0); // 相機位置
    camera.lookAt(0, 1.6, 0); // 相機視角

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current && mountRef.current.appendChild(renderer.domElement); // 加到畫面中

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

    // 羽球動畫檔案清單
    const animationFiles = [
      'left-to-left.glb',
      'left-to-mid.glb',
      'left-to-right.glb',
      'mid-to-left.glb',
      'mid-to-mid.glb',
      'mid-to-right.glb',
      'right-to-left.glb',
      'right-to-mid.glb',
      'right-to-right.glb'
    ];

    const loadAndPlayRandomShuttleAnimation = () => {
      const randomIndex = Math.floor(Math.random() * animationFiles.length);
      const fileName = animationFiles[randomIndex];

      loader.load(`/models/${fileName}`, (gltf) => {
        // 移除舊羽球模型
        if (shuttlecockRef.current) {
          scene.remove(shuttlecockRef.current);
        }

        const shuttle = gltf.scene;
        shuttle.scale.set(1, 1, 1);
        scene.add(shuttle);
        shuttlecockRef.current = shuttle;

        const mixer = new AnimationMixer(shuttle);
        mixerRef.current = mixer;

        const clip = gltf.animations[0];
        if (!clip) return;

        const action = mixer.clipAction(clip);
        action.reset();
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.play();

        currentActionRef.current = action;

        action.onFinished = () => {
          loadAndPlayRandomShuttleAnimation(); // 播完一個動畫就載下一個
        };

        // 邊界框（可視化碰撞）
        const boxHelper = new THREE.BoxHelper(shuttle, 0xffff00);
        scene.add(boxHelper);
        shuttle.userData.boxHelper = boxHelper;
      });
    };

    // 載入第一個隨機羽球動畫
    loadAndPlayRandomShuttleAnimation();

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

      // 移動球拍到手腕座標
      const pos = wristRef.current;
      if (pos && racketRef.current) {
        const { x, y } = pos;
        const mappedZ = (x - 0.5) * 6;
        const mappedY = (1 - y) * 3;
        racketRef.current.position.set(13.8, mappedY, mappedZ);
        racketRef.current.rotation.set(0, Math.PI / 2, 0);
      }

      if (mixerRef.current) {
        mixerRef.current.update(delta); // 更新動畫
      }

      const shuttle = shuttlecockRef.current;
      if (shuttle?.userData.boxHelper) { // 碰撞偵測（球拍 vs 羽球）
        shuttle.userData.boxHelper.update();

        if (racketRef.current) {
          const racketBox = new THREE.Box3().setFromObject(racketRef.current);
          const shuttleBox = new THREE.Box3().setFromObject(shuttle);
          if (racketBox.intersectsBox(shuttleBox)) {
            onShuttleHit?.(directionRef.current); // 通知外部撞到了
            currentActionRef.current?.stop(); // 若碰到就停動畫
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // 畫面縮放調整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 清除資源
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose(); // 避免資源洩漏
    };
  }, []);

  // JSX 回傳畫面容器
  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default BadmintonGameScene;
