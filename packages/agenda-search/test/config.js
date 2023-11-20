'use strict';

const fs = require('fs');

module.exports = {
  alias: 'agenda_service_test',
  site: {
    url: 'https://openagenda.com',
    image: 'https://s3.eu-central-1.amazonaws.com/oastatic/openagenda-185.png'
  },
  defaultImage: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png',
  elasticsearch: {
    node: 'https://' + process.env.OA_ELASTICSEARCH_750_DEV_HOST,
    log: 'trace',
    ssl: process.env.OA_ELASTICSEARCH_750_DEV_USE_SSL ? {
      rejectUnauthorized: !process.env.OA_ELASTICSEARCH_750_DEV_SSL_NO_VERIFY,
      key: fs.readFileSync(process.env.OA_CLIENT_SSL_KEY, 'utf-8'),
      cert: fs.readFileSync(process.env.OA_CLIENT_SSL_CERT, 'utf-8')
    } : null
  }
}
