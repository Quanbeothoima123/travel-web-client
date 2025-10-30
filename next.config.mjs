/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Cho phép TẤT CẢ hostname với https
      },
      {
        protocol: "http",
        hostname: "**", // Cho phép TẤT CẢ hostname với http
      },
    ],
  },
};

export default nextConfig;
