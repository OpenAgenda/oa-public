const detailedLocations = require('./mel-locations.json');
const agenda = require('./mel.json');
const settings = require('./slslf-2022.json');

const defaultAccess = {
  authorized: true, // true
  external: false,
  serviceLabel: null,
  link: null
};

const DetailedLocations = {
  locations: detailedLocations,
  settings: {
    settings,
    access: {
      create: defaultAccess,
      update: defaultAccess,
      merge: defaultAccess,
      delete: defaultAccess
    }
  },
  extraProps: {
    lang: 'fr',
    agenda: {
      ...agenda,
      uid: 1,
    },
  }
};

const sets = {
  DetailedLocations
};

module.exports = Object.assign(function getFixtures(agendaUid) {
  return Object.keys(sets).map(key => sets[key]).find(set => set.extraProps.agenda.uid === parseInt(agendaUid, 10));
}, sets);
