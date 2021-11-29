'use strict';

const detailedLocations = require('./mel-locations.json');
const agenda = require('./mel.json');

const DetailedLocations = {
  locations: detailedLocations,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...agenda,
      uid: 1,
    }
  }
};

const sets = {
  DetailedLocations
};

module.exports = Object.assign(function getFixtures(agendaUid) {
  return Object.keys(sets).map(key => sets[key]).find(set => set.extraProps.agenda.uid === parseInt(agendaUid, 10));
}, sets);
