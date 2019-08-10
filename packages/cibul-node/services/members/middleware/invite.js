"use strict";

module.exports = ( members, req, res, next ) => members.set.byEmail.bulk( {
  agendaUid: req.agenda.uid,
  role: req.body.role
}, req.body.emails, {
  requireCustom: false,
  context: req.context
} ).then( ( { queued } ) => {
  res.status( 200 ).json( {
    success: true,
    queued: !!queued
  } );
}, next );
