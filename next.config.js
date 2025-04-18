/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // 빌드 시 ESLint 오류 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 TypeScript 오류 무시
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 