'use strict';

module.exports = {
  verifyAndLoadAccessTokenUser: require('./verifyAndLoadAccessTokenUser'),
  verifyAndLoadKeyUser: require('./verifyAndLoadKeyUser'),
  verifyEventEditionRights: require('./verifyEventEditionRights'),
  verifySuperAdmin: require('./verifySuperAdmin'),
  member: require('./member'),
  loadAgenda: require('./loadAgenda'),
  redirectIfPrivate: require('./redirectIfPrivate'),
  loadEvent: require('./loadEvent'),
  parseBodyData: require('./parseBodyData'),
  requestAccessToken: require('./requestAccessToken')
}
