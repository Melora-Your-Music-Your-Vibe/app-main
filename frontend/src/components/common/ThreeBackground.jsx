import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground({ variant = 'default' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Transparent background renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent
    currentMount.appendChild(renderer.domElement);

    // Particle System (Artistic continuous animation)
    const particleCount = variant === 'auth' ? 2500 : 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x10b981); // Mint Green
    const color2 = new THREE.Color(0x0ea5e9); // Cyan
    const color3 = new THREE.Color(0x8b5cf6); // Soft Purple

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Random positions inside a sphere
      const radius = 25 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);

      // Mix colors
      const mixedColor = color1.clone().lerp(Math.random() > 0.5 ? color2 : color3, Math.random());
      colors[i] = mixedColor.r;
      colors[i + 1] = mixedColor.g;
      colors[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom shader material for soft glowing particles
    const material = new THREE.PointsMaterial({
      size: variant === 'auth' ? 0.25 : 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 40;

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event) => {
      mouseX = (event.clientX - windowHalfX) * 0.001;
      mouseY = (event.clientY - windowHalfY) * 0.001;
    };

    if (variant === 'auth') {
      document.addEventListener('mousemove', onDocumentMouseMove, false);
    }

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous rotation
      particles.rotation.y = elapsedTime * 0.05;
      particles.rotation.x = elapsedTime * 0.025;
      particles.rotation.z = Math.sin(elapsedTime * 0.1) * 0.1;

      // Mouse parallax effect
      if (variant === 'auth') {
        targetX = mouseX * 2;
        targetY = mouseY * 2;
        particles.rotation.y += 0.05 * (targetX - particles.rotation.y);
        particles.rotation.x += 0.05 * (targetY - particles.rotation.x);
      }

      // Add a breathing effect to particle sizes
      const positionsArr = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        // Subtle wave motion
        positionsArr[i+1] += Math.sin(elapsedTime * 2 + positionsArr[i]) * 0.01;
      }
      particles.geometry.attributes.position.needsUpdate = true;

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
      if (variant === 'auth') {
        document.removeEventListener('mousemove', onDocumentMouseMove);
      }
      currentMount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [variant]);

  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: variant === 'auth' ? 'radial-gradient(circle at center, #0a1118 0%, #03070a 100%)' : 'transparent',
      }}
    />
  );
}
