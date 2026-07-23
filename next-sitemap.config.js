/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.hacienda-encanto.com',
  generateRobotsTxt: true,
  // App Router with dynamic Server Components no se detecta automáticamente
  exclude: ['/*'],
  additionalPaths: async () => [
    { loc: '/',                         changefreq: 'monthly', priority: 1.0,  lastmod: new Date().toISOString() },
    { loc: '/bodas',                    changefreq: 'monthly', priority: 0.9,  lastmod: new Date().toISOString() },
    { loc: '/quince-anos',              changefreq: 'monthly', priority: 0.9,  lastmod: new Date().toISOString() },
    { loc: '/eventos-empresariales',    changefreq: 'monthly', priority: 0.9,  lastmod: new Date().toISOString() },
    { loc: '/revelacion-de-genero',     changefreq: 'monthly', priority: 0.9,  lastmod: new Date().toISOString() },
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/portal/', '/admin/', '/editor/', '/login', '/api/'],
      },
    ],
  },
};
