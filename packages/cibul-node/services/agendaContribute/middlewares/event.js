"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/event' );

const core = require( '../../../core' );

module.exports = ( req, res, next ) => {

  core.agendas( req.agenda.uid ).events.get( req.params.eventUid, { internal: true } ).then( event => {

    if ( !event ) return next( 404 );

    req.event = event;

    next();

  } ).catch( err => {

    next( err );

  } );

}
