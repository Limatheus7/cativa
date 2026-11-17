import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 10.0.2.2 é o "localhost" do computador visto de dentro do emulador Android.
  // 192.168.0.2 é o computador visto do celular na mesma rede Wi-Fi.
  allowedDevOrigins: ["10.0.2.2", "192.168.0.2"],
};

export default nextConfig;
