'use strict';

const parseAgendaBucket = require('../utils/parseAgendaBucket');

module.exports.formatDSL = () => ({
  terms: {
    field: 'originAgenda._agg'
  }
})

module.exports.formatResult = ({
  buckets
}) => buckets.map(parseAgendaBucket);
