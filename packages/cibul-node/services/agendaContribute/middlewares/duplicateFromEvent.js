"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/duplicateFromEvent' );

const core = require( '../../../core' );

module.exports = async ( req, res, next ) => {

  if ( !req.query.agendaUid || !req.query.eventUid ) {

    return next();

  }

  const mergedSchemaFields = _.get( await core.agendas( req.query.agendaUid ).settings.get(), 'fields', [] );

  const event = await core.agendas( req.query.agendaUid ).events.get( req.query.eventUid );

  if ( !event ) {

    return next();

  }

  // some fields are not duplicatable
  const unduplicatableFields = [ 'agenda', 'slug', 'uid', 'fileKey', 'state', 'timings' ].concat( mergedSchemaFields.filter( f => !_.get( f, 'duplicatable', true ) ).map( f => f.field ) );

  if ( req.agenda.uid !== parseInt( req.query.agendaUid ) ) {

    unduplicatableFields.push( 'locationUid' );

  }

  // location cannot be used as is.
  req.event = ih( event, { $unset: unduplicatableFields } );

  next();

}
