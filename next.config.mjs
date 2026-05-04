import createMDX from '@next/mdx';

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'mdx'],
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : undefined,
};

export default withMDX(nextConfig);
