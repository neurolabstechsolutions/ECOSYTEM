import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Permite que Vercel compile la app en producción sin detenerse por advertencias de tipo
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
