"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

import Atmosphere from "./Atmosphere";
import Markers from "./Markers";
import { GlobeTeamData } from "@/lib/data/globe-teams";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface EarthProps {
  teams: GlobeTeamData[];
  selectedCountry: GlobeTeamData | null;
  onSelectCountry: (country: GlobeTeamData | null) => void;
}

export default function Earth({ teams, selectedCountry, onSelectCountry }: EarthProps) {
  const earthRef = useRef<THREE.Group>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Load premium high-res textures
  const [colorMap, nightMap, specularMap, bumpMap, cloudsMap] = useTexture([
    "/textures/earth/earth-blue-marble.jpg",
    "/textures/earth/earth-night.jpg",
    "/textures/earth/earth-specular.png",
    "/textures/earth/earth-topology.png",
    "/textures/earth/earth-clouds.png",
  ]);

  // Interaction State
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 }); // To clamp pitch and apply smooth momentum
  
  // Auto-rotation State
  const autoRotate = useRef(!selectedCountry);

  // Zoom State
  const targetZoom = useRef(5);
  const { camera } = useThree();

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const minZoom = 2.5; // Closest
      const maxZoom = 10.0; // Furthest
      targetZoom.current += e.deltaY * 0.002;
      targetZoom.current = THREE.MathUtils.clamp(targetZoom.current, minZoom, maxZoom);
    };

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    autoRotate.current = !selectedCountry;
    
    if (selectedCountry && earthRef.current) {
      // Calculate target rotation to center the country
      const targetX = selectedCountry.lat * (Math.PI / 180);
      // Corrected Y calculation to bring the longitude exactly to the +Z (camera)
      const rawTargetY = -(selectedCountry.lng + 90) * (Math.PI / 180);

      // Find the shortest path for Y rotation
      const currentY = targetRotation.current.y;
      let diffY = rawTargetY - currentY;
      diffY = Math.atan2(Math.sin(diffY), Math.cos(diffY)); // Normalize to -PI to PI
      
      // Add a full 360 degree spin (2 * PI) in the positive direction — but
      // skip the showy extra revolution (and shorten the travel) for visitors
      // who prefer reduced motion; just ease straight to centre.
      const spin = reducedMotion ? 0 : Math.PI * 2;
      const finalTargetY = currentY + diffY + spin;

      // Also slightly zoom in when a country is selected
      targetZoom.current = 3.5;

      gsap.to(targetRotation.current, {
        x: targetX,
        y: finalTargetY,
        duration: reducedMotion ? 0.6 : 2.5,
        ease: reducedMotion ? "power2.out" : "power3.inOut",
        onUpdate: () => {
          // Instantly sync the velocity to 0 during animation to avoid jumps
          rotationVelocity.current = { x: 0, y: 0 };
        }
      });
    } else {
      // Reset zoom when deselecting
      targetZoom.current = 5;
    }
  }, [selectedCountry, reducedMotion]);

  useFrame((_, delta) => {
    if (!earthRef.current) return;

    // Smooth Zoom
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZoom.current, 0.1);

    if (autoRotate.current && !isDragging.current && !reducedMotion) {
      // Slow, meditative auto-rotation (paused under reduced-motion)
      targetRotation.current.y += 0.05 * delta;
    } else if (!isDragging.current && !selectedCountry) {
      // Apply momentum
      targetRotation.current.x += rotationVelocity.current.x;
      targetRotation.current.y += rotationVelocity.current.y;
      
      // Dampen velocity
      rotationVelocity.current.x *= 0.95;
      rotationVelocity.current.y *= 0.95;
    }

    // Clamp pitch (X-axis) ONLY when freely exploring. 
    // When a country is selected, allow it to center accurately.
    if (!selectedCountry) {
      targetRotation.current.x = THREE.MathUtils.clamp(targetRotation.current.x, -0.6, 0.6);
    }

    // Apply rotation with smoothing (lerp)
    earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x, targetRotation.current.x, 0.1);
    earthRef.current.rotation.y = THREE.MathUtils.lerp(earthRef.current.rotation.y, targetRotation.current.y, 0.1);
  });

  // Pointer event handlers for drag interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (selectedCountry) {
      // Deselect on drag start
      onSelectCountry(null);
    }
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
    rotationVelocity.current = { x: 0, y: 0 };
    document.body.style.cursor = "grabbing";
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    // Movement sensitivity
    const sensitivityX = 0.005;
    const sensitivityY = 0.005;

    targetRotation.current.y += deltaX * sensitivityX;
    targetRotation.current.x += deltaY * sensitivityY;
    
    // Store velocity for momentum when released
    rotationVelocity.current = {
      y: deltaX * sensitivityX * 0.1,
      x: deltaY * sensitivityY * 0.1
    };

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    document.body.style.cursor = "auto";
  };

  return (
    <group 
      ref={earthRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
    >
      {/* Earth Sphere */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.015}
          specularMap={specularMap}
          specular={new THREE.Color("grey")}
          shininess={30}
        />
      </mesh>

      {/* Night Lights Sphere (Additive blending slightly larger) */}
      <mesh>
        <sphereGeometry args={[2.001, 64, 64]} />
        <meshBasicMaterial 
          map={nightMap} 
          blending={THREE.AdditiveBlending} 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Clouds Sphere */}
      <mesh>
        <sphereGeometry args={[2.008, 64, 64]} />
        <meshStandardMaterial 
          map={cloudsMap}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Atmosphere radius={2.05} />
      
      <Markers 
        teams={teams} 
        radius={2.01} 
        selectedCountry={selectedCountry}
        onSelectCountry={onSelectCountry}
      />
    </group>
  );
}
