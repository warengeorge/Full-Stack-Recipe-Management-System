/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.themealdb.com'],
  },
  reactStrictMode: true,
  env: {
    BASE_URL: process.env.BASE_URL,
  }
};

export default nextConfig;
