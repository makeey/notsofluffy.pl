import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost", "api.notsofluffy.pl"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },

      {
        protocol: "http",
        hostname: "192.168.100.19",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.notsofluffy.pl",
        pathname: "/uploads/**",
      },
    ],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
