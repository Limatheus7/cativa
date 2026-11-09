import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 10.0.2.2 é o "localhost" do computador visto de dentro do emulador Android.
  allowedDevOrigins: ["10.0.2.2"],
};

export default nextConfig;
