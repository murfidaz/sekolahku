import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // digunakan karena packagenya tidak boleh digabung dengan backpack
  serverExternalPackages: ["pino", "pino-pretty"],
};

export default nextConfig;
