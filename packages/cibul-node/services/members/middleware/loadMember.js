"use strict";

module.exports = ( members, req, res, next ) => {
  members.get( {
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  } ).then( member => {
    if ( !member ) return next( 'Member not found' );
    req.member = member;
    next();
  }, next );
}
