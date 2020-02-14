'use strict';

const _ = require('lodash');
const onError = require('../../errors').bind(null, 'eventSearch');

const log = require('@openagenda/logs')('services/eventSearch/buildSearchConfig');

module.exports = config => {
  const node = _.get(config, 'es75.host', 'http://localhost:9200');

  log('using elasticsearch node %s', node);

  return {
    elasticsearch: {
      node
    },
    defaultIndex: process.env.NODE_ENV === 'production' ? 'main' : 'dev',

    logger: config.getLogConfig('svc', 'eventSearch')
  }
}
