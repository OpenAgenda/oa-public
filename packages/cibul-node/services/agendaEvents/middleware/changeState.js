"use strict";

const core = require( '../../../core' );

module.exports = ( req, res, next ) => {
  core.agendas( req.agenda.uid ).events.update( req.event.uid, {
    state: req.params.state
  }, {
    partial: true,
    context: {
      userUid: req.user.uid
    }
  } ).then( result => {
    res.redirect( 302, `/${req.agenda.slug}/events/${req.event.slug}` );
  }, next );
}
