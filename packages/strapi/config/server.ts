export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
    url: `${env.int('SSL') ? 'https://' : 'http://'}${env('URL')}`,
  },
  // https://github.com/strapi/strapi/issues/24452
  proxy: { koa: true },
});
