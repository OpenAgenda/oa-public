'use strict';

const fs = require('fs');

module.exports = {
  alias: 'agenda_service_test',
  site: {
    url: 'https://openagenda.com',
    image: 'https://s3.eu-central-1.amazonaws.com/oastatic/openagenda-185.png'
  },
  elasticsearch: {
    node: 'https://' + process.env.ES_HOST,
    log: 'trace',
    ssl: process.env.ES_USE_SSL ? {
      rejectUnauthorized: !process.env.ES_SSL_NO_VERIFY,
      key: fs.readFileSync(process.env.ES_CLIENT_SSL_KEY, 'utf-8'),
      cert: fs.readFileSync(process.env.ES_CLIENT_SSL_CERT, 'utf-8')
    } : null
  }
}