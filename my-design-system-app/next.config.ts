import type { NextConfig } from "next";
import path from "path";

const repoRoot = path.resolve(process.cwd(), "..");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
