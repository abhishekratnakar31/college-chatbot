import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['10.110.155.65'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'www.iitm.ac.in' },
      { protocol: 'https', hostname: 'home.iitd.ac.in' },
      { protocol: 'https', hostname: 'www.iitb.ac.in' },
      { protocol: 'https', hostname: 'www.iitk.ac.in' },
      { protocol: 'https', hostname: 'www.iitkgp.ac.in' },
      { protocol: 'https', hostname: 'www.iitr.ac.in' },
      { protocol: 'https', hostname: 'www.bits-pilani.ac.in' },
      { protocol: 'https', hostname: 'iisc.ac.in' },
      { protocol: 'https', hostname: 'www.aiims.edu' },
      { protocol: 'https', hostname: 'www.iima.ac.in' },
      { protocol: 'https', hostname: 'www.iimb.ac.in' },
      { protocol: 'https', hostname: 'www.nls.ac.in' },
    ],
  },
};

export default nextConfig;
