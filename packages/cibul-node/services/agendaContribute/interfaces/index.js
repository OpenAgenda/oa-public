'use strict';

module.exports = services => ({
  setMember: require('./setMember').bind(null, services),
  setEvent: require('./setEvent').bind(null, services),
  generateUniqueFileKey: require('./generateUniqueFileKey'),
  deleteDraftEvent: require('./deleteDraftEvent').bind(null, services)
})
