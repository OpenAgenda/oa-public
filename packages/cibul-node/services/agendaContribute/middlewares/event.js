"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/event' );

const core = require( '../../../core' );

module.exports = ( req, res, next ) => {

  core.agendas( req.agenda.uid ).events.get( req.params.eventUid ).then( event => {

    if ( !event ) return next( 404 );

    req.event = ih( event, {
      imageCredits: { $set: _.get( event, 'image.credits' ) }
    } );

    next();

  } ).catch( err => {

    next( err );

  } );

}
