/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // eslint: {
  //   ignoreDuringBuilds: true, // Ubah ke true untuk skip error eslint saat build
  // },
}

export default nextConfig