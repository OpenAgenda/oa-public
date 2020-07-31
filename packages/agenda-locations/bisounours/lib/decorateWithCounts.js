'use strict';

const _ = require('lodash');

module.exports = (locations, countsByUid, keys = ['eventCount', 'agendaEventCount']) => {
  locations.forEach(location => {
    const index = _.findIndex(countsByUid, { uid: location.uid });

    keys.forEach(key => {
      location[key] = index === -1 ? 0 : countsByUid[index][key];
    });

    if (index !== -1) {
      countsByUid.splice(index, 1);
    }
  });
}
