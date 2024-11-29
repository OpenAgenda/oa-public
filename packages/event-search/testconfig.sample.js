import fs from 'node:fs';

export default {
  elasticsearch: {
    // node: 'https://es7.openagenda.com',
    node: `https://${process.env.OA_ELASTICSEARCH_750_DEV_HOST}`,
    log: 'trace',
    ssl: process.env.OA_ELASTICSEARCH_750_DEV_USE_SSL
      ? {
        key: fs.readFileSync(process.env.OA_CLIENT_SSL_KEY, 'utf-8'),
        cert: fs.readFileSync(process.env.OA_CLIENT_SSL_CERT, 'utf-8'),
      }
      : null,
  },
  defaultIndex: 'test',
  interfaces: {},
  emptyValue: 'null',
  defaultImage: '//cdn.openagenda.com/static/graylogo140.png',
  assetsPath: 'https://some.cdn/',
};
