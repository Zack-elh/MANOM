import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost/the-barber-house/backend/api/:path*",
      },
    ];
  },
};

export default nextConfig;
