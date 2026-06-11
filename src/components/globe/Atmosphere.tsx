"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

export default function Atmosphere({ radius = 2.05 }) {
  // A custom Fresnel shader for the atmospheric edge glow
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.2, 0.4, 0.8, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}
