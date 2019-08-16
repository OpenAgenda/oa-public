"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const agendas = require( '@openagenda/agendas' );
const custom = require( '@openagenda/custom' );
const events = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/get' );

const getAgenda = require( '../utils/getAgenda' );
const getMergedSchema = require( '../settings/getMergedSchema' );
const getNetwork = require( '../utils/getNetwork' );


module.exports = async ( agendaUid, eventUid, options = {} ) => {

  const {
    internal,
    lang,
    customOnly,
    access,
    includeSchema
  } = _.assign( {
    internal: false, // load internal use fields ( id )
    lang: null,
    customOnly: false, // only fetch custom values
    access: null, // filter to values matching specific access rights
    includeSchema: false
  }, options );

  const agenda = await getAgenda( agendaUid );

  const {
    formSchemaId,
    networkUid,
    id: agendaId
  } = agenda;

  const result = {
    event: {}
  };

  let network;

  if ( !customOnly ) {
    Object.assign(
      result.event,
      await events
        .get( { uid: eventUid }, { internal } )
        .then( e => _.omit( e, [ 'id' ] ) )
      );
  }

  const loadCustomFields = _eventIsLoaded( result.event ) || customOnly;

  if ( loadCustomFields && formSchemaId ) {

    const customData = await custom( formSchemaId ).get( eventUid );

    if ( customData ) {

      _.assign( result.event, customData );

    }

  }

  if ( loadCustomFields && networkUid ) {

    network = await getNetwork( networkUid );

    const customData = await custom( _.get( network, 'formSchemaId' ) ).get( eventUid );

    if ( customData ) {

      _.assign( result.event, customData );

    }

  }

  result.event = _.set(
    lang ? _flatten( result.event, lang ) : result.event,
    'agenda',
    _.pick( agenda, [ 'uid', 'slug', 'title', 'description', 'image', 'url' ].concat( internal ? [ 'id' ] : [] ) )
  );

  if ( includeSchema || access ) {

    result.schema = await getMergedSchema( agenda, { preloadedNetwork: network } );

  }

  _filterByAccess( result, access );

  return includeSchema ? result : result.event;

}


function _filterByAccess( data, access = null ) {

  const { event, schema } = data;

  if ( !access ) return;

  const unsets = _.get( schema, 'fields', [] ).filter(
    f => f.read && ![].concat( f.read ).includes( access )
  ).map( f => f.field );

  if ( !unsets.length ) return;

  data.event = ih( event, { $unset: unsets } );

  // filter out fields from schema
  data.schema.fields = data.schema.fields.filter( f => !unsets.includes( f.field ) );

}


function _eventIsLoaded( data ) {

  return !!_.get( data, 'uid' );

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
