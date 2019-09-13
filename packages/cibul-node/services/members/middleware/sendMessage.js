"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/members/middleware/sendMessage' );

let messages;

module.exports = ( req, res, next ) => {
  if ( !messages ) {
    return res.status( 500 ).send( 'Service not initialized' );
  }

  log( 'sending message for agenda %s', req.agenda.uid, req.query );

  messages( Object.assign( req.query || {}, {
    agendaUid: req.agenda.uid,
    role: _.get( req, 'query.credentials' )
  } ), {
    message: req.body.message,
    lang: req.lang,
    replyTo: req.body.replyTo,
    withActions: req.body.inactive ? false : null,
    agenda: _.pick( req.agenda, [ 'uid', 'slug', 'title', 'image' ] )
  } );

  res.send( 'gemini jellikers batman' );
}

module.exports.init = m => messages = m;
