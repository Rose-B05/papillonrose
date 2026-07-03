/** @type {import('next').NextConfig} */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const nextConfig = {
  basePath: BASE,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ]
  },
}

export default nextConfig
