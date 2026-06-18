"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GlobeTeamData } from "@/lib/data/globe-teams";
import { getTeam } from "@/lib/data/teams";

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
      onPointerOut={() => {
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

      {/* Hover: floating team logo with a 3D/depth pop */}
      {hovered && !isSelected && (
        <Html center distanceFactor={8} zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
          <div className="globe-marker-logo">
            <div className="globe-marker-logo-3d" style={{ background: getTeam(team.code).colors[0] }}>
              <span className="globe-marker-logo-code">{team.code}</span>
              <img
                src={`/logos/${team.code.toLowerCase()}.png`}
                alt=""
                className="globe-marker-logo-img"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
              />
            </div>
            <span className="globe-marker-name">{team.name}</span>
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
