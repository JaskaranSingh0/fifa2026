"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GlobeTeamData } from "@/lib/data/globe-teams";

interface MarkersProps {
  teams: GlobeTeamData[];
  radius: number;
  onSelectCountry: (country: GlobeTeamData) => void;
  selectedCountry: GlobeTeamData | null;
}

// Convert Lat/Lng to Cartesian coordinates
const getCoordinates = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

function Marker({ 
  team, 
  radius, 
  isSelected, 
  onSelect 
}: { 
  team: GlobeTeamData; 
  radius: number; 
  isSelected: boolean; 
  onSelect: () => void 
}) {
  const [hovered, setHovered] = useState(false);
  const pos = getCoordinates(team.lat, team.lng, radius);
  
  // Outer glow scale animation
  const outerRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (outerRef.current) {
      const targetScale = isSelected ? 2.5 : hovered ? 1.8 : 1.2;
      outerRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      if (isSelected) {
        // Pulsing effect when selected
        const pulse = 1.5 + Math.sin(state.clock.elapsedTime * 4) * 0.5;
        outerRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  return (
    <group 
      position={pos} 
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Core Node */}
      <mesh>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Glow */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Label */}
      {(hovered || isSelected) && !isSelected && (
        <Html distanceFactor={10} zIndexRange={[100, 0]} className="pointer-events-none">
          <div className="text-white text-xs tracking-[0.2em] font-light uppercase ml-3 mt-[-10px] drop-shadow-md whitespace-nowrap">
            {team.name}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Markers({ teams, radius, onSelectCountry, selectedCountry }: MarkersProps) {
  return (
    <group>
      {teams.map((team) => (
        <Marker 
          key={team.code}
          team={team}
          radius={radius}
          isSelected={selectedCountry?.code === team.code}
          onSelect={() => onSelectCountry(team)}
        />
      ))}
    </group>
  );
}
