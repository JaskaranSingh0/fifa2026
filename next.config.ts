import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile Three.js ecosystem packages for Next.js App Router
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],

  // Required for React Three Fiber with React 18+
  reactStrictMode: false,

  // Turbopack config (Next.js 16+ default bundler)
  turbopack: {},
};

export default nextConfig;
