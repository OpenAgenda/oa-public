'use strict';

const parseAgendaBucket = require('../utils/parseAgendaBucket');

module.exports.formatDSL = (field, options = {}) => ({
  terms: {
    field: 'originAgenda._agg',
    size: options.size
  }
})

module.exports.formatResult = ({
  buckets
}) => buckets.map(parseAgendaBucket);
