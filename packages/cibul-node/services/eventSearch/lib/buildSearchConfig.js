'use strict';

const _ = require('lodash');
const onError = require('../../errors').bind(null, 'eventSearch');

module.exports = config => ({
  elasticsearch: {
    node: `http://${_.get(config, 'es75.host', 'localhost')}:${_.get(config, 'es75.port', 9200)}/`
  },

  defaultIndex: 'main',

  predefinedAggregations: {

    keywords: {
      type: 'terms',
      field: 'search_internals_keywords',
      destination: 'keywords'
    },

    timingsByMonth: {
      type: 'timings',
      format: 'YYYY-MM',
      interval: 'month',
      destination: 'timingsByMonth'
    },

    languages: {
      type: 'terms',
      field: 'search_internals_languages',
      destination: 'languages'
    },

    eventsByMonthlyDay: {
      type: 'timingsReverseHits',
      format: 'YYYY-MM-dd',
      interval: 'day',
      destination: 'days'
    },

    eventsByWeeklyDay: {
      type: 'timingsReverseHits',
      format: 'YYYY-MM-dd',
      interval: 'day',
      destination: 'days',
      size: 10
    },

    agendas: {
      type: 'objectsAsTerms',
      field: 'search_internals_agenda',
      destination: 'agendas'
    }

  },

  logger: config.getLogConfig('svc', 'eventSearch'),

  interfaces: {
    onError
  },

});
