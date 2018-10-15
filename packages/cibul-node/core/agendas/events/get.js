"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const agendas = require( '@openagenda/agendas' );
const custom = require( '@openagenda/custom' );
const events = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/get' );

const getAgenda = require( '../utils/getAgenda' );

module.exports = async ( agendaUid, eventUid, options = {} ) => {

  const cleanOptions = _.assign( { lang: null }, options );

  const agenda = await getAgenda( agendaUid );

  const {
    formSchemaId,
    networkUid,
    id: agendaId
  } = agenda;

  const fetchedEvent = await events.get( { uid: eventUid } );

  if ( fetchedEvent && formSchemaId ) {

    const customData = await custom( formSchemaId ).get( eventUid );

    if ( customData ) {

      _.assign( fetchedEvent, customData );

    }

  }

  return _.set( 
    cleanOptions.lang ? _flatten( fetchedEvent, cleanOptions.lang ) : fetchedEvent, 
    'agenda', 
    _.pick( agenda, [ 'uid', 'slug', 'title', 'description', 'image', 'url' ].concat( cleanOptions.internal ? [ 'id' ] : [] ) ) 
  );

}


function _flatten( event, lang ) {

  return ih( event, [
    'title',
    'description',
    'keywords',
    'longDescription',
    'conditions'
  ].reduce( ( flattened, field ) => _.set( flattened, field, {
    $set: _.get( event, [ field, lang ] , _.get( event, [ field, _.first( _.keys( event[ field ] ) ) ] ) )
  } ), {} ) );

}
