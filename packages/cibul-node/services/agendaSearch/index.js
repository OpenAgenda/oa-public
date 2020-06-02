'use strict';

const _ = require('lodash');
const { promisify } = require('util');

const agendaLocations = require('@openagenda/agenda-locations');
const agendaSearch = require('@openagenda/agenda-search');

const listLocationTerms = promisify(agendaLocations.list.terms);

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
    site: {
      url: config.root,
      image: config.logo
    },
    listAgendas: async (query, offset, limit, { detailed }) => {
      const agendas = (
        await services.agendas.list(query, offset, limit, { detailed: true, indexed: true })
      ).agendas.map(a => _.assign(a, { keywords: [] }));

      if (!detailed) return agendas;

      for (const agenda of agendas) {
        await _decorateWithDetails(agenda);
      }

      return agendas;
    }
  });

}

async function _decorateWithDetails(agenda) {
  agenda.keywords = [];

  for (const term of ['region', 'department', 'city']) {
    const result = await listLocationTerms([ term ], { agendaId: agenda.id });

    result.map(r => r[ term ]).forEach(keyword => !agenda.keywords.includes(keyword) ? agenda.keywords.push(keyword) : null);
  }
  return agenda;
}
