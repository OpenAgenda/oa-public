const detailedLocations = require('./mel-locations.json');
const agenda = require('./mel.json');
const settings = require('./slslf-2022.json');

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null
};

const externalAccess = {
  authorized: false,
  external: true,
  serviceLabel: 'google',
  link: 'google.com'
};

const Locations = {
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

const LocationsSet = {
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
      uid: 2,
    },
  }
};

const ExternalAccessLocations = {
  locations: detailedLocations,
  settings: {
    settings,
    access: {
      create: externalAccess,
      update: externalAccess,
      merge: externalAccess,
      delete: externalAccess
    }
  },
  extraProps: {
    lang: 'fr',
    agenda: {
      ...agenda,
      uid: 3,
    },
  }
};

const ErrorLocations = {
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
      uid: 4,
    },
  }
};

const sets = {
  Locations,
  LocationsSet,
  ExternalAccessLocations,
  ErrorLocations,
};

module.exports = Object.assign(function getFixtures(agendaUid) {
  return Object.keys(sets).map(key => sets[key]).find(set => set.extraProps.agenda.uid === parseInt(agendaUid, 10));
}, sets);
