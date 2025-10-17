export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
    url: `${env.int('SSL') ? 'https://' : 'http://'}${env('URL')}`,
  },
  proxy: { koa: true },
});
