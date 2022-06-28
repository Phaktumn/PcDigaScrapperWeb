/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'imgix' 
  },
  images: {
    domains: [
      'static.pcdiga.com', 
      'socialistmodernism.com', 
      'img.globaldata.pt',
      'imgix.com'
    ],
  }
}

module.exports = nextConfig
