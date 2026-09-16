import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Some next.js versions require it here
  },
  // In latest next.js, allowedDevOrigins is top level
  allowedDevOrigins: [
    '192.168.1.6',
    '192.168.1.6:3002',
    '192.168.1.18',
    '192.168.1.18:3002',
    '192.168.1.29',
    '192.168.1.29:3002',
    '192.168.1.33',
    '192.168.1.33:3002',
    'localhost:3002',
    'localhost:3000',
    '127.0.0.1:3002',
  ],
};

export default nextConfig;
