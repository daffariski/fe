import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const enablePwaInDev = process.env.NEXT_PUBLIC_PWA_DEV === "true";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development" && !enablePwaInDev,
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [
      "localhost",
    ],
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

export default withPWA(nextConfig);
