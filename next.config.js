/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["*"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
    ],
  },
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
