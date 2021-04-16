'use strict';

const _ = require('lodash');
const fs = require('fs');

module.exports = (suffix = 'test') => {
  const agendas = JSON.parse(fs.readFileSync(
    `${__dirname}/../fixtures/agendas.${suffix}.json`, 
    'utf-8'
  ));

  return async agenda => _.pick(agendas.filter(a => agenda.uid === a.uid).pop(), [
    'publishedEvents',
    'recentlyContributedEvents',
    'upcomingPublishedEvents',
    'eventCountsByState',
    'keywords',
    'network',
    'locationSet'
  ]);
}
