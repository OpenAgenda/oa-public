"use strict";

module.exports = ( members, req, res, next ) => {
  members.get( {
    agendaUid: req.agenda.uid,
    id: req.params.id
  } ).then( member => {
    if ( !member ) return next( 'Member not found' );
    req.targetMember = member;
    next();
  }, next );
}

module.exports.byEmail = ( members, req, res, next ) => {
  members.get.byEmail( {
    agendaUid: req.agenda.uid,
    email: req.body.email
  } ).then( member => {
    if ( !member ) return next( 'Member not found' );
    req.targetMember = member;
    next();
  }, next );
}
