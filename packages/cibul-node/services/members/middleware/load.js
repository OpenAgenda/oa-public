"use strict";

const log = require( '@openagenda/logs' )( 'services/members/middleware/loadMember' );

module.exports = ( members, req, res, next ) => {
  log( 'loading current user member reference' );
  _load( members, req ).then( next, next );
}

module.exports.loadOrFail = ( members, req, res, next ) => {
  log( 'loading current user member reference... or fail' );
  _load( members, req ).then( () => {
    if ( !req.member ) {
      res.setStatus( 403 );
      return next( 'Not a member' );
    }
    next();
  } );
}

function _load( members, req ) {
  return members.get( {
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  } ).then( member => {
    req.member = member;
  } );
}
