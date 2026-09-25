import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

/**
 * Aurora3DBackground — Dual 3D Engine for AgriNex
 * 
 * 1. LIGHT THEME: "Living Farm"
 *    - Organic agricultural 3D ecosystem: Farm → Crop → Market → Buyer → Growth
 *    - Floating 3D leaves with wind flutter, tumbling seeds, upward growth pollen,
 *      soft sunlight rays, abstract crop stalks, terraced contour waves.
 * 
 * 2. DARK THEME: "Smart Agricultural Network"
 *    - Futuristic intelligent agricultural network: Farmer → AI → Market → Buyer → Transport → Global Network
 *    - Rotating 3D wireframe cyber globe, interconnected nodes, dynamic data transmission arcs,
 *      flowing telemetry packets, cyber matrix grid floor, floating cyber data particles.
 * 
 * Features:
 *  - 100% distinct 3D scenes (completely different objects, geometries, shaders, animations)
 *  - Smooth ~800ms crossfade transition on theme switch
 *  - GPU-optimized Three.js rendering with complete resource disposal
 *  - Tab visibility auto-pause (document.hidden)
 *  - prefers-reduced-motion accessibility
 *  - Mobile performance scaling (low particle density, simplified geometries)
 *  - Non-blocking pointer events (pointer-events: none, z-index: 0)
 */

export default function Aurora3DBackground() {
  const containerRef = useRef(null);
  const { isDark } = useTheme();
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check device capability & reduced motion preference
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionFactor = prefersReducedMotion ? 0.12 : 1.0;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 36);

    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: !isMobile,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // Append canvas to container
    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    container.appendChild(canvas);

    // Mouse coordinates with smooth damping
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / width) * 2 - 1;
      mouse.targetY = -(e.clientY / height) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // =========================================================================
    // 1. LIGHT THEME: "LIVING FARM" (Organic Agricultural Ecosystem)
    // =========================================================================
    const lightGroup = new THREE.Group();
    scene.add(lightGroup);

    // Light Theme Lighting
    const lightAmbient = new THREE.AmbientLight(0xf0fdf4, 1.2);
    lightGroup.add(lightAmbient);

    const sunLight = new THREE.DirectionalLight(0xfef9c3, 1.4);
    sunLight.position.set(24, 30, 20);
    lightGroup.add(sunLight);

    const skyWarmLight = new THREE.DirectionalLight(0xdcfce7, 0.8);
    skyWarmLight.position.set(-20, -10, 15);
    lightGroup.add(skyWarmLight);

    // A. 3D Floating Organic Leaves (Curved procedural diamond leaf geometry)
    const leafCount = isMobile ? 14 : 26;
    const leafGroup = new THREE.Group();
    lightGroup.add(leafGroup);

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, -1.2);
    leafShape.bezierCurveTo(0.65, -0.6, 0.85, 0.4, 0, 1.5);
    leafShape.bezierCurveTo(-0.85, 0.4, -0.65, -0.6, 0, -1.2);

    const leafGeometry = new THREE.ShapeGeometry(leafShape, 8);
    // Subtle curl in 3D
    const leafPos = leafGeometry.attributes.position;
    for (let i = 0; i < leafPos.count; i++) {
      const y = leafPos.getY(i);
      const x = leafPos.getX(i);
      leafPos.setZ(i, -Math.cos(x * 1.8) * 0.25 + Math.sin(y * 0.8) * 0.15);
    }
    leafGeometry.computeVertexNormals();

    const leafColors = [0x16a34a, 0x22c55e, 0x4ade80, 0x86efac, 0x15803d];
    const leaves = [];

    for (let i = 0; i < leafCount; i++) {
      const col = leafColors[i % leafColors.length];
      const mat = new THREE.MeshLambertMaterial({
        color: col,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isMobile ? 0.32 : 0.42,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(leafGeometry, mat);
      const scale = 0.8 + Math.random() * 0.9;
      mesh.scale.set(scale, scale, scale);

      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 44,
        (Math.random() - 0.5) * 28
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const leafData = {
        mesh,
        baseY: mesh.position.y,
        speedY: (0.012 + Math.random() * 0.016) * motionFactor,
        flutterSpeed: (0.8 + Math.random() * 1.2) * motionFactor,
        flutterAmp: 0.15 + Math.random() * 0.25,
        rotSpeedX: (Math.random() - 0.5) * 0.015 * motionFactor,
        rotSpeedY: (Math.random() - 0.5) * 0.018 * motionFactor,
        phase: Math.random() * Math.PI * 2
      };
      leaves.push(leafData);
      leafGroup.add(mesh);
    }

    // B. Tiny Floating Seeds & Spores (Golden-amber capsules)
    const seedCount = isMobile ? 12 : 22;
    const seedGroup = new THREE.Group();
    lightGroup.add(seedGroup);

    const seedGeom = new THREE.SphereGeometry(0.35, 8, 6);
    seedGeom.scale(0.5, 1.4, 0.5); // Elongated seed shape

    const seedMat = new THREE.MeshLambertMaterial({
      color: 0xeab308,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });

    const seeds = [];
    for (let i = 0; i < seedCount; i++) {
      const mesh = new THREE.Mesh(seedGeom, seedMat);
      mesh.position.set(
        (Math.random() - 0.5) * 55,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 24
      );
      seeds.push({
        mesh,
        speedY: (0.008 + Math.random() * 0.014) * motionFactor,
        speedX: (Math.random() - 0.5) * 0.01 * motionFactor,
        rotSpeed: (0.01 + Math.random() * 0.02) * motionFactor,
        phase: Math.random() * 10
      });
      seedGroup.add(mesh);
    }

    // C. Upward Agricultural Growth Particles (Chlorophyll & Golden Pollen Motes)
    const pollenCount = isMobile ? 70 : 150;
    const pollenGeom = new THREE.BufferGeometry();
    const pollenPositions = new Float32Array(pollenCount * 3);
    const pollenColors = new Float32Array(pollenCount * 3);
    const pollenSpeeds = [];

    const cPollenGold = new THREE.Color(0xf59e0b);
    const cPollenGreen = new THREE.Color(0x22c55e);
    const cPollenLime = new THREE.Color(0x84cc16);

    for (let i = 0; i < pollenCount; i++) {
      pollenPositions[i * 3] = (Math.random() - 0.5) * 70;
      pollenPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pollenPositions[i * 3 + 2] = (Math.random() - 0.5) * 35;

      const pickColor = Math.random() > 0.6 ? cPollenGold : Math.random() > 0.5 ? cPollenLime : cPollenGreen;
      pollenColors[i * 3] = pickColor.r;
      pollenColors[i * 3 + 1] = pickColor.g;
      pollenColors[i * 3 + 2] = pickColor.b;

      pollenSpeeds.push({
        vy: (0.015 + Math.random() * 0.025) * motionFactor,
        vx: (Math.random() - 0.5) * 0.008 * motionFactor,
        phase: Math.random() * Math.PI * 2
      });
    }
    pollenGeom.setAttribute('position', new THREE.BufferAttribute(pollenPositions, 3));
    pollenGeom.setAttribute('color', new THREE.BufferAttribute(pollenColors, 3));

    const pollenMat = new THREE.PointsMaterial({
      size: isMobile ? 0.9 : 1.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const pollenPoints = new THREE.Points(pollenGeom, pollenMat);
    lightGroup.add(pollenPoints);

    // D. Soft Sunlight Rays (Translucent shimmering diagonal planes)
    const sunRaysGroup = new THREE.Group();
    lightGroup.add(sunRaysGroup);

    const rayGeom = new THREE.PlaneGeometry(16, 65);
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 3; i++) {
      const ray = new THREE.Mesh(rayGeom, rayMat);
      ray.position.set(10 + i * 8, 12, -8 + i * 4);
      ray.rotation.z = -Math.PI / 5 + i * 0.08;
      ray.rotation.y = 0.2;
      sunRaysGroup.add(ray);
    }

    // E. 3D Abstract Crop / Wheat Stalk Silhouettes (Ground Horizon)
    const stalkCount = isMobile ? 12 : 24;
    const stalksGroup = new THREE.Group();
    lightGroup.add(stalksGroup);

    const stalkGeom = new THREE.CylinderGeometry(0.06, 0.12, 14, 5);
    const earGeom = new THREE.ConeGeometry(0.32, 2.2, 5);
    earGeom.translate(0, 7.5, 0);

    const cropMat = new THREE.MeshLambertMaterial({
      color: 0x16a34a,
      transparent: true,
      opacity: 0.25,
      depthWrite: false
    });

    const cropStalks = [];
    for (let i = 0; i < stalkCount; i++) {
      const stalkPivot = new THREE.Group();
      const stalk = new THREE.Mesh(stalkGeom, cropMat);
      stalk.position.y = 7;
      const ear = new THREE.Mesh(earGeom, cropMat);
      stalkPivot.add(stalk);
      stalkPivot.add(ear);

      const x = -35 + (70 / stalkCount) * i + (Math.random() - 0.5) * 2;
      const z = -14 + Math.random() * 8;
      stalkPivot.position.set(x, -24, z);
      stalkPivot.scale.set(0.9, 0.7 + Math.random() * 0.5, 0.9);

      cropStalks.push({
        pivot: stalkPivot,
        baseRotZ: (Math.random() - 0.5) * 0.1,
        speed: (0.8 + Math.random() * 0.6) * motionFactor,
        phase: i * 0.4
      });
      stalksGroup.add(stalkPivot);
    }

    // F. Curved Terraced Field Contour Waves (Ground undulating ribbon)
    const contourCount = isMobile ? 8 : 16;
    const contourGroup = new THREE.Group();
    lightGroup.add(contourGroup);

    const contourCurves = [];
    for (let r = 0; r < contourCount; r++) {
      const points = [];
      const yBase = -16 + (r / contourCount) * 8;
      const zBase = -20 + r * 2.5;

      for (let c = -35; c <= 35; c += 5) {
        points.push(new THREE.Vector3(c, yBase, zBase));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const geom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const mat = new THREE.LineBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.12 + (r / contourCount) * 0.15
      });
      const line = new THREE.Line(geom, mat);
      contourGroup.add(line);
      contourCurves.push({ line, r, initialPoints: points, yBase, zBase });
    }

    // =========================================================================
    // 2. DARK THEME: "SMART AGRICULTURAL NETWORK" (Intelligent Cyber Agro-Grid)
    // =========================================================================
    const darkGroup = new THREE.Group();
    scene.add(darkGroup);

    // Dark Theme Lighting
    const darkAmbient = new THREE.AmbientLight(0x0f172a, 0.8);
    darkGroup.add(darkAmbient);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 1.8, 80);
    cyanPoint.position.set(16, 12, 10);
    darkGroup.add(cyanPoint);

    const emeraldPoint = new THREE.PointLight(0x10b981, 2.2, 80);
    emeraldPoint.position.set(-18, -8, 12);
    darkGroup.add(emeraldPoint);

    const amberTelemetryLight = new THREE.PointLight(0xf59e0b, 1.2, 50);
    amberTelemetryLight.position.set(0, 18, -5);
    darkGroup.add(amberTelemetryLight);

    // A. 3D Wireframe Cyber Globe with Continental Clusters
    const globeGroup = new THREE.Group();
    darkGroup.add(globeGroup);
    globeGroup.position.set(isMobile ? 0 : 16, isMobile ? -6 : -2, -10);

    const globeRadius = isMobile ? 8.5 : 12;
    const globeGeom = new THREE.SphereGeometry(globeRadius, 24, 20);
    const globeWireMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });
    const globeWire = new THREE.Mesh(globeGeom, globeWireMat);
    globeGroup.add(globeWire);

    // Globe Latitude/Longitude Rings
    const ringCount = 5;
    for (let r = 0; r < ringCount; r++) {
      const ringGeom = new THREE.RingGeometry(globeRadius * 0.98, globeRadius * 1.02, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.14
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2 + (r - 2) * 0.35;
      globeGroup.add(ring);
    }

    // B. Connected Network Nodes (Farmer, Mandi, AI, Reefer, Buyer, Global Export)
    const nodeLocations = [
      { name: 'Farmer Hub Nashik', pos: new THREE.Vector3(-18, 6, 4), color: 0x10b981, type: 'FARMER' },
      { name: 'Farmer Hub Punjab', pos: new THREE.Vector3(-22, -4, 2), color: 0x10b981, type: 'FARMER' },
      { name: 'Farmer Hub AP', pos: new THREE.Vector3(-14, -10, 6), color: 0x10b981, type: 'FARMER' },
      { name: 'AI AGMARKNET Hub', pos: new THREE.Vector3(-4, 12, -2), color: 0x8b5cf6, type: 'AI' },
      { name: 'Price Discovery Core', pos: new THREE.Vector3(2, 6, 2), color: 0x06b6d4, type: 'AI' },
      { name: 'Reefer Cold Fleet 1', pos: new THREE.Vector3(-8, -2, 8), color: 0xf59e0b, type: 'TRANSIT' },
      { name: 'Reefer Cold Fleet 2', pos: new THREE.Vector3(4, -8, 6), color: 0xf59e0b, type: 'TRANSIT' },
      { name: 'Wholesale Mandi Azadpur', pos: new THREE.Vector3(12, 10, 2), color: 0x3b82f6, type: 'BUYER' },
      { name: 'Buyer Escrow Terminal', pos: new THREE.Vector3(16, 2, 4), color: 0x10b981, type: 'ESCROW' },
      { name: 'Global Agri Export Port', pos: new THREE.Vector3(20, -6, -4), color: 0x06b6d4, type: 'EXPORT' }
    ];

    const nodeMeshes = [];
    const nodeGroup = new THREE.Group();
    darkGroup.add(nodeGroup);

    const nodeCoreGeom = new THREE.IcosahedronGeometry(0.7, 1);
    const haloGeom = new THREE.RingGeometry(0.9, 1.25, 24);

    nodeLocations.forEach((n, idx) => {
      const nodeSubGroup = new THREE.Group();
      nodeSubGroup.position.copy(n.pos);

      // Core mesh
      const coreMat = new THREE.MeshBasicMaterial({
        color: n.color,
        wireframe: false,
        transparent: true,
        opacity: 0.95
      });
      const core = new THREE.Mesh(nodeCoreGeom, coreMat);
      nodeSubGroup.add(core);

      // Outer wire frame
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const outerWire = new THREE.Mesh(nodeCoreGeom, wireMat);
      outerWire.scale.set(1.4, 1.4, 1.4);
      nodeSubGroup.add(outerWire);

      // Halo pulse ring
      const haloMat = new THREE.MeshBasicMaterial({
        color: n.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      const halo = new THREE.Mesh(haloGeom, haloMat);
      nodeSubGroup.add(halo);

      nodeGroup.add(nodeSubGroup);
      nodeMeshes.push({
        group: nodeSubGroup,
        core,
        outerWire,
        halo,
        baseScale: 1.0,
        phase: idx * 0.7
      });
    });

    // C. Dynamic Data Transmission Arcs & Data Packets (Farmer → AI → Market → Buyer → Transport)
    const arcConnections = [
      [0, 3], // Farmer Nashik -> AI Hub
      [1, 3], // Farmer Punjab -> AI Hub
      [2, 4], // Farmer AP -> Price Core
      [3, 4], // AI Hub -> Price Core
      [0, 5], // Farmer -> Reefer Fleet 1
      [5, 8], // Reefer Fleet 1 -> Escrow Terminal
      [4, 7], // Price Core -> Azadpur Mandi
      [7, 8], // Azadpur Mandi -> Escrow
      [8, 6], // Escrow -> Reefer 2
      [8, 9], // Escrow -> Global Export
      [6, 9]  // Reefer 2 -> Global Export
    ];

    const dataArcGroup = new THREE.Group();
    darkGroup.add(dataArcGroup);

    const dataPackets = [];
    const packetGeom = new THREE.SphereGeometry(0.35, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    arcConnections.forEach(([fromIdx, toIdx], connIdx) => {
      const p1 = nodeLocations[fromIdx].pos;
      const p2 = nodeLocations[toIdx].pos;

      // Arc mid-point with elevation for 3D trajectory
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.z += 3.5;
      mid.y += (Math.random() - 0.5) * 3;

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(36);
      const arcGeom = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: connIdx % 2 === 0 ? 0x059669 : 0x0284c7,
        transparent: true,
        opacity: 0.28
      });
      const arcLine = new THREE.Line(arcGeom, arcMat);
      dataArcGroup.add(arcLine);

      // Data packet traveling along the curve
      const packetMesh = new THREE.Mesh(packetGeom, packetMat);
      dataArcGroup.add(packetMesh);

      dataPackets.push({
        mesh: packetMesh,
        curve,
        progress: (connIdx / arcConnections.length) + Math.random() * 0.2,
        speed: (0.006 + Math.random() * 0.008) * motionFactor
      });
    });

    // D. Digital Agricultural Grid (Cyber matrix plane on floor)
    const gridHelper = new THREE.GridHelper(70, 35, 0x10b981, 0x064e3b);
    gridHelper.position.set(0, -18, -4);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.22;
    darkGroup.add(gridHelper);

    // E. Floating Cyber Data Particles (Zero-gravity telemetry packets)
    const cyberParticleCount = isMobile ? 65 : 160;
    const cyberGeom = new THREE.BufferGeometry();
    const cyberPositions = new Float32Array(cyberParticleCount * 3);
    const cyberColors = new Float32Array(cyberParticleCount * 3);
    const cyberVelocities = [];

    const cCyan = new THREE.Color(0x06b6d4);
    const cEmerald = new THREE.Color(0x10b981);
    const cOrange = new THREE.Color(0xf97316);

    for (let i = 0; i < cyberParticleCount; i++) {
      cyberPositions[i * 3] = (Math.random() - 0.5) * 75;
      cyberPositions[i * 3 + 1] = (Math.random() - 0.5) * 55;
      cyberPositions[i * 3 + 2] = (Math.random() - 0.5) * 35;

      const pick = Math.random();
      const col = pick > 0.65 ? cCyan : pick > 0.15 ? cEmerald : cOrange;
      cyberColors[i * 3] = col.r;
      cyberColors[i * 3 + 1] = col.g;
      cyberColors[i * 3 + 2] = col.b;

      cyberVelocities.push({
        vx: (Math.random() - 0.5) * 0.015 * motionFactor,
        vy: (Math.random() - 0.5) * 0.015 * motionFactor,
        vz: (Math.random() - 0.5) * 0.01 * motionFactor
      });
    }
    cyberGeom.setAttribute('position', new THREE.BufferAttribute(cyberPositions, 3));
    cyberGeom.setAttribute('color', new THREE.BufferAttribute(cyberColors, 3));

    const cyberMat = new THREE.PointsMaterial({
      size: isMobile ? 1.0 : 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cyberPoints = new THREE.Points(cyberGeom, cyberMat);
    darkGroup.add(cyberPoints);

    // =========================================================================
    // 3. SMOOTH THEME SWITCHING (600–1000ms Transition State Machine)
    // =========================================================================
    let transitionProgress = isDarkRef.current ? 1.0 : 0.0;
    let targetTransition = isDarkRef.current ? 1.0 : 0.0;

    // Set initial group visibility
    lightGroup.visible = !isDarkRef.current;
    darkGroup.visible = isDarkRef.current;

    // =========================================================================
    // 4. ANIMATION & RENDER LOOP
    // =========================================================================
    let animId;
    let clock = new THREE.Clock();
    let isTabVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        clock.getDelta(); // reset delta to prevent huge jumps
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleResize = () => {
      if (!renderer || !camera) return;
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      animId = requestAnimationFrame(render);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime() * motionFactor;

      // Mouse Parallax Easing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      camera.position.x = mouse.x * 2.5;
      camera.position.y = mouse.y * 1.8;
      camera.lookAt(0, 0, 0);

      // --- Theme Transition Progress Easing (~800ms) ---
      targetTransition = isDarkRef.current ? 1.0 : 0.0;
      // Exponential smoothing factor: approaches target smoothly in ~800ms
      transitionProgress += (targetTransition - transitionProgress) * (delta * 4.2);

      // Clamp threshold
      if (Math.abs(transitionProgress - targetTransition) < 0.005) {
        transitionProgress = targetTransition;
      }

      // Group visibility & vertical translation shift
      lightGroup.visible = transitionProgress < 0.99;
      darkGroup.visible = transitionProgress > 0.01;

      // Organic vertical gliding on transition
      lightGroup.position.y = -transitionProgress * 6;
      darkGroup.position.y = (1.0 - transitionProgress) * 6;

      // --- ANIMATE LIGHT THEME: "LIVING FARM" ---
      if (lightGroup.visible) {
        // A. Leaves wind flutter
        leaves.forEach((l) => {
          l.mesh.position.y -= l.speedY;
          l.mesh.position.x += Math.sin(time * l.flutterSpeed + l.phase) * (l.flutterAmp * 0.05);
          l.mesh.rotation.x += l.rotSpeedX;
          l.mesh.rotation.y += l.rotSpeedY;
          l.mesh.rotation.z = Math.sin(time * 0.8 + l.phase) * 0.35;

          // Wrap bottom to top
          if (l.mesh.position.y < -24) {
            l.mesh.position.y = 24;
            l.mesh.position.x = (Math.random() - 0.5) * 60;
          }
        });

        // B. Seeds tumbling
        seeds.forEach((s) => {
          s.mesh.position.y -= s.speedY;
          s.mesh.position.x += Math.sin(time + s.phase) * 0.02;
          s.mesh.rotation.x += s.rotSpeed;
          s.mesh.rotation.z += s.rotSpeed * 0.5;

          if (s.mesh.position.y < -22) {
            s.mesh.position.y = 22;
          }
        });

        // C. Pollen rising upward
        const pArr = pollenPoints.geometry.attributes.position.array;
        for (let i = 0; i < pollenCount; i++) {
          pArr[i * 3 + 1] += pollenSpeeds[i].vy;
          pArr[i * 3] += Math.sin(time * 0.5 + pollenSpeeds[i].phase) * 0.02;

          if (pArr[i * 3 + 1] > 26) {
            pArr[i * 3 + 1] = -26;
            pArr[i * 3] = (Math.random() - 0.5) * 70;
          }
        }
        pollenPoints.geometry.attributes.position.needsUpdate = true;

        // D. Crop stalks swaying
        cropStalks.forEach((cs) => {
          cs.pivot.rotation.z = cs.baseRotZ + Math.sin(time * cs.speed + cs.phase) * 0.06;
        });

        // E. Contour wave animation
        contourCurves.forEach((cc) => {
          const pos = cc.line.geometry.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const wave = Math.sin(x * 0.08 + time * 0.9 + cc.r * 0.4) * 0.55;
            pos.setY(i, cc.yBase + wave);
          }
          pos.needsUpdate = true;
        });
      }

      // --- ANIMATE DARK THEME: "SMART AGRICULTURAL NETWORK" ---
      if (darkGroup.visible) {
        // A. Wireframe globe slow continuous rotation
        globeGroup.rotation.y += 0.0018 * motionFactor;
        globeGroup.rotation.x = Math.sin(time * 0.2) * 0.08;

        // B. Network node pulsation & halo expansion
        nodeMeshes.forEach((nm) => {
          const pulse = 1.0 + Math.sin(time * 2.2 + nm.phase) * 0.15;
          nm.core.scale.set(pulse, pulse, pulse);
          nm.outerWire.rotation.x += 0.008;
          nm.outerWire.rotation.y += 0.012;

          const haloScale = 1.0 + Math.sin(time * 1.8 + nm.phase) * 0.35;
          nm.halo.scale.set(haloScale, haloScale, haloScale);
          nm.halo.material.opacity = Math.max(0.1, 0.45 - (haloScale - 1.0) * 0.5);
        });

        // C. Data packets traveling along bezier arcs
        dataPackets.forEach((dp) => {
          dp.progress = (dp.progress + dp.speed) % 1.0;
          const pos = dp.curve.getPoint(dp.progress);
          dp.mesh.position.copy(pos);
          const packetPulse = 0.8 + Math.sin(dp.progress * Math.PI) * 0.5;
          dp.mesh.scale.set(packetPulse, packetPulse, packetPulse);
        });

        // D. Cyber grid wave
        gridHelper.position.z = -4 + Math.sin(time * 0.4) * 1.5;

        // E. Cyber particles floating
        const cArr = cyberPoints.geometry.attributes.position.array;
        for (let i = 0; i < cyberParticleCount; i++) {
          cArr[i * 3] += cyberVelocities[i].vx;
          cArr[i * 3 + 1] += cyberVelocities[i].vy;
          cArr[i * 3 + 2] += cyberVelocities[i].vz;

          // Boundary bounce / wrap
          if (cArr[i * 3] > 38 || cArr[i * 3] < -38) cyberVelocities[i].vx *= -1;
          if (cArr[i * 3 + 1] > 28 || cArr[i * 3 + 1] < -28) cyberVelocities[i].vy *= -1;
          if (cArr[i * 3 + 2] > 18 || cArr[i * 3 + 2] < -18) cyberVelocities[i].vz *= -1;
        }
        cyberPoints.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    render();

    // =========================================================================
    // 5. CLEANUP & MEMORY MANAGEMENT (DISPOSE THREE.JS ARTIFACTS)
    // =========================================================================
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Traverse & dispose geometries, materials, textures
      scene.traverse((obj) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    />
  );
}
