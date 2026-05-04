/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  // Electron carga archivos vía file:// — usar rutas relativas en producción
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : undefined,
};

export default nextConfig;
