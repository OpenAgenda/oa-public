'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendaSearch');

const agendaSearch = require('@openagenda/agenda-search');
const listAgendas = require('./lib/listAgendas');
const plugApp = require('./plugApp');

module.exports.init = (config, services) => {
  const port = _.get(config, 'es75.port', 9200);
  const protocol = _.get(config, 'es75.protocol', _.get(config, 'es75.ssl') ? 'https' : 'http');
  const host = _.get(config, 'es75.host', 'localhost');

  const search = agendaSearch({
    alias: config.agendaSearchAlias,
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
    listAgendas: listAgendas(services),
    getDetailedAgenda: agenda => {
      log('getting detailed info for agenda %s', agenda.slug)
      return services.core
        .agendas(agenda.uid).get({
          detailed: 1,
          access: 'internal',
          includeEvent: true
        });
    }
  });

  return Object.assign(search, {
    plugApp: plugApp.bind(null, config, services, search)
  });
}
