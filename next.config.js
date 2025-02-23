/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable CSS handling since this is an API-only project
  css: false,
  // Disable client-side features
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "http://localhost:4200" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "*" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ]
      }
    ]
  }
};

module.exports = nextConfig; 