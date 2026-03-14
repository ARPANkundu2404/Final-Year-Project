/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = { ...config.resolve.alias, "mapbox-gl": false };
    }
    return config;
  },
  images: { domains: ["api.mapbox.com"] },
};

module.exports = nextConfig;