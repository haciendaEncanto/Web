/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.hacienda-encanto.com',
  generateRobotsTxt: true,
  exclude: [
    '/portal',
    '/portal/*',
    '/admin',
    '/admin/*',
    '/editor',
    '/editor/*',
    '/login',
    '/registro',
    '/api/*',
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
