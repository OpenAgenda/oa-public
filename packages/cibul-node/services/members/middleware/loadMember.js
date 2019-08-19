"use strict";

const log = require( '@openagenda/logs' )( 'services/members/middleware/loadMember' );

module.exports = ( members, req, res, next ) => {
  log( 'loading current user member reference' );
  members.get( {
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  } ).then( member => {
    req.member = member;
    next();
  }, next );
}
