'use strict';

const _ = require('lodash');
const agendas = require('../fixtures/agendas.json');

module.exports = async agenda => _.pick(agendas.filter(a => agenda.uid === a.uid).pop(), [
  'publishedEvents',
  'upcomingPublishedEvents',
  'keywords',
  'network'
]);
