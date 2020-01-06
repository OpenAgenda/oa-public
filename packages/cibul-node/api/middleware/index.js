"use strict";

module.exports = {
  verifyAndLoadAccessTokenUser: require( './verifyAndLoadAccessTokenUser' ),
  verifyAndLoadKeyUser: require( './verifyAndLoadKeyUser' ),
  verifyEventEditionRights: require( './verifyEventEditionRights' ),
  verifyMember: require( './verifyMember' ),
  verifySuperAdmin: require( './verifySuperAdmin' ),
  loadAgenda: require( './loadAgenda' ),
  loadEvent: require( './loadEvent' ),
  parseBodyData: require( './parseBodyData' )
}
