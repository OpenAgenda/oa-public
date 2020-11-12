'use strict';

module.exports = {
  verifyAndLoadAccessTokenUser: require('./verifyAndLoadAccessTokenUser'),
  verifyAndLoadKeyUser: require('./verifyAndLoadKeyUser'),
  verifyEventEditionRights: require('./verifyEventEditionRights'),
  member: require('./member'),
  loadAgenda: require('./loadAgenda'),
  eventUpdate: require('./eventUpdate'),
  redirectIfPrivate: require('./redirectIfPrivate'),
  loadEvent: require('./loadEvent'),
  parseBodyData: require('./parseBodyData'),
  requestAccessToken: require('./requestAccessToken')
}
