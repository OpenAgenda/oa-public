'use strict';

const _ = require('lodash');

const agendaSearch = require('@openagenda/agenda-search');
const log = require('@openagenda/logs')('services/agendaSearch');

const listAgendas = require('./listAgendas');
const getAgendaSummary = require('./getAgendaSummary');

module.exports.init = (config, services) => {
  const port = _.get(config, 'es75.port', 9200);
  const protocol = _.get(config, 'es75.protocol', _.get(config, 'es75.ssl') ? 'https' : 'http');
  const host = _.get(config, 'es75.host', 'localhost');

  return agendaSearch({
    elasticsearch: {
      node: protocol + '://' + host + ':' + port,
      ssl: _.get(config, 'es75.ssl')
    },
    imagePath: config.aws.imageBucketPath.replace('cibuldev', 'cibul'),
    defaultImage: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png',
    logger: config.getLogConfig('svc', 'agendaSearch'),
    site: {
      url: config.root,
      image: config.logo
    },
    listAgendas: listAgendas.bind(null, services),
    getAgendaSummary: getAgendaSummary.bind(null, config, services)
  });
}
