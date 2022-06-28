/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: 'https://pcdigascrapper.herokuapp.com',
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
