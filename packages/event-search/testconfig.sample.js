'use strict';

const fs = require('fs');

module.exports = {
  elasticsearch: {
    //node: 'https://es7.openagenda.com',
    node: 'https://' + process.env.OA_ELASTICSEARCH_750_DEV_HOST,
    log: 'trace',
    ssl: process.env.OA_ELASTICSEARCH_750_DEV_USE_SSL ? {
      key: fs.readFileSync(process.env.OA_CLIENT_SSL_KEY, 'utf-8'),
      cert: fs.readFileSync(process.env.OA_CLIENT_SSL_CERT, 'utf-8')
    } : null
  },
  defaultIndex: 'test',
  interfaces: {},
  emptyValue: 'null',
  defaultImage: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
}
