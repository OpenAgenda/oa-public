'use strict';

const _ = require('lodash');
const onError = require('../../errors').bind(null, 'eventSearch');

const log = require('@openagenda/logs')('services/eventSearch/buildSearchConfig');

module.exports = config => {
  const node = `http://${_.get(config, 'es75.host', 'localhost')}:${_.get(config, 'es75.port', 9200)}/`;

  log('using elasticsearch node %s', node);

  return {
    elasticsearch: {
      node
    },
    defaultIndex: 'main',

    logger: config.getLogConfig('svc', 'eventSearch')
  }
}
