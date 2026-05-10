import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FloatingParticles({ count = 200 }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  const colors = useMemo(() => {
    const col = new Float32Array(count * 3);
    const palette = [
      [0.114, 0.725, 0.329], // green
      [0.118, 0.843, 0.376], // light green
      [0.231, 0.510, 0.965], // blue
      [0.616, 0.353, 0.969], // purple
      [0.969, 0.353, 0.620], // pink
    ];
    for (let i = 0; i < count; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return col;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
      const posArr = mesh.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        posArr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.002;
      }
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function GlowOrb({ position, color, speed = 1 }) {
  const mesh = useRef();
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 1.5;
      mesh.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * speed * 0.3) * 1;
      mesh.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * speed * 0.4) * 0.5;
      const scale = 1 + Math.sin(state.clock.elapsedTime * speed) * 0.2;
      mesh.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
  );
}

function ArtisticWave() {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.elapsedTime;
      const position = mesh.current.geometry.attributes.position;
      
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const z = Math.sin(x * 0.5 + time) * 0.5 + Math.cos(y * 0.5 + time * 0.8) * 0.5;
        position.setZ(i, z);
      }
      position.needsUpdate = true;
      mesh.current.rotation.z = time * 0.05;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -4]} rotation={[-Math.PI / 3, 0, 0]}>
      <planeGeometry args={[25, 25, 32, 32]} />
      <meshStandardMaterial 
        color="#1db954" 
        wireframe 
        transparent 
        opacity={0.15} 
        emissive="#1db954"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

export default function ThreeBackground({ variant = 'default' }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none',
    }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.3} />
        <FloatingParticles count={variant === 'auth' ? 300 : 150} />
        <GlowOrb position={[-3, 2, -2]} color="#1db954" speed={0.8} />
        <GlowOrb position={[4, -1, -3]} color="#3b82f6" speed={0.6} />
        <GlowOrb position={[-2, -3, -1]} color="#9b5de5" speed={1} />
        {variant === 'auth' && (
          <>
            <ArtisticWave />
            <GlowOrb position={[2, 3, -4]} color="#f15bb5" speed={0.7} />
            <GlowOrb position={[0, 0, -5]} color="#00f5d4" speed={0.5} />
          </>
        )}
      </Canvas>
    </div>
  );
}
