"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/middlewares/duplicateFromEvent' );

const core = require( '../../../core' );

module.exports = async ( req, res, next ) => {

  const agendaUid = _.get( req, 'query.agendaUid', req.agenda.uid );

  if ( !req.query.eventUid ) {

    return next();

  }

  const mergedSchemaFields = _.get( await core.agendas( agendaUid ).settings.get(), 'fields', [] );

  const event = await core.agendas( agendaUid ).events.get( req.query.eventUid );

  if ( !event ) {

    return next();

  }

  // some fields are not duplicatable
  const unduplicatableFields = [ 'agenda', 'slug', 'uid', 'fileKey', 'state', 'timings' ].concat( mergedSchemaFields.filter( f => !_.get( f, 'duplicatable', true ) ).map( f => f.field ) );

  if ( req.agenda.uid !== parseInt( agendaUid ) ) {

    unduplicatableFields.push( 'locationUid' );

  }

  // location cannot be used as is.
  req.event = ih( event, { $unset: unduplicatableFields } );

  next();

}
