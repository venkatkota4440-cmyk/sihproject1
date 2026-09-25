import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import CanvasFallbackHero from './CanvasFallbackHero';

// Enhanced Agricultural 3D Environment with dynamic wind, window cursor parallax & glowing crops
function AgriculturalScene({ mouseRef }) {
  const fieldRef = useRef();
  const cropsGroupRef = useRef();
  const sunRef = useRef();
  const auroraRingRef = useRef();
  const particlesRef = useRef();
  const lightRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Fluid cursor parallax using window mouse coordinates
    const mx = mouseRef?.current?.x || 0;
    const my = mouseRef?.current?.y || 0;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mx * 3.2, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 3.8 + my * 1.8, 0.05);
    state.camera.lookAt(0, 0.5, 0);

    // Dynamic light tracking
    if (lightRef.current) {
      lightRef.current.position.x = 8 + mx * 5;
      lightRef.current.position.y = 16 + my * 4;
    }

    // Wind wave animation across crop stalks with multi-frequency harmonics
    if (cropsGroupRef.current) {
      cropsGroupRef.current.children.forEach((crop, i) => {
        const x = crop.position.x;
        const z = crop.position.z;
        // Traveling realistic harmonic wind
        const wind =
          Math.sin(time * 2.6 + x * 0.75 + z * 0.45) * 0.18 +
          Math.cos(time * 1.3 + z * 0.35) * 0.08 +
          (mx * 0.06);
        crop.rotation.z = wind;
        crop.rotation.x = Math.cos(time * 1.9 + x * 0.35) * 0.06;
      });
    }

    // Gentle sun pulse
    if (sunRef.current) {
      const scale = 1 + Math.sin(time * 1.4) * 0.05;
      sunRef.current.scale.set(scale, scale, scale);
    }

    // Rotating iridescent Aurora ring
    if (auroraRingRef.current) {
      auroraRingRef.current.rotation.z = time * 0.12;
      auroraRingRef.current.rotation.x = Math.PI / 3 + Math.sin(time * 0.4) * 0.08;
      auroraRingRef.current.rotation.y = time * 0.08;
    }

    // Floating Spores particle swirl
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.06;
      particlesRef.current.rotation.x = Math.sin(time * 0.08) * 0.04;
    }
  });

  // Generate dense grid of wheat & crop stalks
  const cropRows = React.useMemo(() => {
    const rows = [];
    for (let x = -6.0; x <= 6.0; x += 0.68) {
      for (let z = -4.2; z <= 3.8; z += 0.72) {
        // Natural organic jitter
        const jx = x + Math.sin(x * 7 + z * 13) * 0.16;
        const jz = z + Math.cos(x * 11 + z * 5) * 0.16;
        rows.push([jx, 0, jz]);
      }
    }
    return rows;
  }, []);

  // Floating bio-luminescent spore positions
  const sporePositions = React.useMemo(() => {
    const pos = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, []);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight
        ref={lightRef}
        position={[8, 16, 10]}
        intensity={2.0}
        color="#fef08a"
        castShadow
      />
      <directionalLight position={[-10, 10, -5]} intensity={0.8} color="#6ee7b7" />
      <pointLight position={[0, 4, 0]} intensity={0.6} color="#10b981" />
      <pointLight position={[4, 2, -2]} intensity={0.4} color="#f59e0b" />

      {/* Floating Low-Poly Fluffy Clouds */}
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <group position={[-4.5, 4.4, -4.5]}>
          <mesh position={[0, 0, 0]}>
            <dodecahedronGeometry args={[1.2, 0]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} opacity={0.88} transparent />
          </mesh>
          <mesh position={[1.0, -0.2, 0.2]}>
            <dodecahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} opacity={0.88} transparent />
          </mesh>
          <mesh position={[-0.9, -0.15, -0.1]}>
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} opacity={0.88} transparent />
          </mesh>
        </group>

        <group position={[5.2, 5.0, -3.5]}>
          <mesh position={[0, 0, 0]}>
            <dodecahedronGeometry args={[1.4, 0]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} opacity={0.9} transparent />
          </mesh>
          <mesh position={[1.2, -0.1, -0.2]}>
            <dodecahedronGeometry args={[1.0, 0]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} opacity={0.9} transparent />
          </mesh>
        </group>
      </Float>

      {/* Iridescent Aurora Borealis Floating Halo Ring */}
      <group position={[0, 3.8, -3.5]} ref={auroraRingRef}>
        <mesh>
          <torusGeometry args={[4.2, 0.08, 16, 64]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[Math.PI / 6, 0, 0]}>
          <torusGeometry args={[4.6, 0.06, 16, 64]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 6, 0, 0]}>
          <torusGeometry args={[3.8, 0.05, 16, 64]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Floating Golden Crop & Gem Polyhedrons */}
      <Float speed={2.2} rotationIntensity={0.6} floatIntensity={0.9}>
        {/* Golden Wheat Polyhedron */}
        <mesh position={[3.4, 2.5, 0.5]}>
          <octahedronGeometry args={[0.46, 0]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.7}
            roughness={0.15}
            emissive="#f59e0b"
            emissiveIntensity={0.45}
          />
        </mesh>

        {/* Emerald Sprout Polyhedron */}
        <mesh position={[-3.8, 2.9, -0.2]}>
          <octahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial
            color="#10b981"
            metalness={0.6}
            roughness={0.15}
            emissive="#059669"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Ruby Harvest Tomato Polyhedron */}
        <mesh position={[2.0, 3.4, -1.8]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color="#ef4444"
            metalness={0.6}
            roughness={0.15}
            emissive="#dc2626"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Sapphire Cold-Chain Transporter Crystal */}
        <mesh position={[-1.8, 3.1, -1.5]}>
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial
            color="#0284c7"
            metalness={0.7}
            roughness={0.15}
            emissive="#0369a1"
            emissiveIntensity={0.35}
          />
        </mesh>
      </Float>

      {/* Radiant Sun Orb with Corona Ring */}
      <group position={[7.2, 6.5, -8.5]}>
        <mesh ref={sunRef}>
          <sphereGeometry args={[2.0, 28, 28]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        {/* Soft Corona Ring */}
        <mesh>
          <ringGeometry args={[2.1, 3.2, 36]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Rolling Low-Poly Agricultural Ground Ridge */}
      <mesh ref={fieldRef} position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 22, 36, 36]} />
        <meshStandardMaterial color="#047857" roughness={0.75} metalness={0.1} />
      </mesh>

      {/* Dense Swaying Wheat & Grain Crop Stalks */}
      <group ref={cropsGroupRef} position={[0, -0.5, 0]}>
        {cropRows.map((pos, idx) => {
          const isGolden = idx % 2 === 0;
          return (
            <group key={idx} position={pos}>
              {/* Green Flexible Stalk */}
              <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.025, 0.045, 0.9, 6]} />
                <meshStandardMaterial
                  color={isGolden ? '#059669' : '#10b981'}
                  roughness={0.6}
                />
              </mesh>
              {/* Golden Wheat Grain Head / Bud */}
              <mesh position={[0, 0.95, 0]}>
                <coneGeometry args={[0.11, 0.38, 6]} />
                <meshStandardMaterial
                  color={isGolden ? '#fbbf24' : '#f59e0b'}
                  roughness={0.35}
                  emissive={isGolden ? '#d97706' : '#b45309'}
                  emissiveIntensity={0.2}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Floating Bio-Luminescent Golden Spores / Fireflies */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={150}
            array={sporePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#fef08a"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

// Error Boundary for Three.js WebGL context failures
class ThreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.warn('WebGL initialization failed, falling back to 2D Canvas:', err.message);
  }

  render() {
    if (this.state.hasError) {
      return <CanvasFallbackHero />;
    }
    return this.props.children;
  }
}

export default function ThreeDHero() {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGLSupported(false);
    } catch (e) {
      setWebGLSupported(false);
    }

    const handleMouseMove = (e) => {
      // Normalized coordinates from -1 to 1
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!webGLSupported) {
    return <CanvasFallbackHero />;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        borderRadius: '24px',
        overflow: 'hidden'
      }}
    >
      <ThreeErrorBoundary>
        <Canvas
          camera={{ position: [0, 4, 8], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <AgriculturalScene mouseRef={mouseRef} />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
}
