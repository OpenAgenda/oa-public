"use strict";

const schema = require( 'validators/schema' );

const agendas = require( 'agendas' );

const logger = require( 'logger' );

const formSchemas = require( 'form-schemas' );

const getDecorate = require( 'form-schemas/iso/getDecorate' );

const ih = require( 'immutability-helper' );

let log = console.log;

schema.register( {
  boolean: require( 'validators/boolean' ),
  pass: require( 'validators/pass' )
} );

const validateOptions = schema( {
  detailed: {
    type: 'boolean',
    default: false
  },
  private: {
    type: 'boolean',
    default: false
  },
  includeCustom: {
    type: 'boolean',
    default: false
  },
  // if agenda data was loaded prior to search call, it can be reused here
  agenda: {
    type: 'pass',
    default: null
  }
} );


module.exports = async ( searchIndex, agendaUid, query, nav, options = {} ) => {

  const cleanOptions = validateOptions( options );

  let searchOptions = {
    detailed: cleanOptions.detailed,
    extensions: [ 'contributor', 'state' ]
  };

  let parseEvent;

  if ( cleanOptions.includeCustom ) {

    searchOptions.extensions.push( 'custom' );

    parseEvent = await _loadCustomDataParser( agendaUid, cleanOptions );

  }

  if ( cleanOptions.private && cleanOptions.includeCustom ) {

    searchOptions = ih( searchOptions, {
      extensions: { $push: [ 'customModerator', 'customAdministrator' ] },
      merge: {
        // private custom data can be bundled together with the rest of the custom data
        $set: { custom: [ 'custom', 'customModerator', 'customAdministrator' ] }
      }
    } );

  }

  return searchIndex.search( query, nav, searchOptions )

    .then( ( { events, total } ) => ( {
      total,
      events: parseEvent ? events.map( parseEvent ) : events
    } ) );

}


module.exports.init = c => {

  log = logger( 'services/eventSearch/agendaIndexSearch' );

}


/**
 * some custom field types are indexed without their values.
 * For choice types ( radio & checkbox ), only the ids are indexed.
 *
 * Once events are retrieved from the index, a decoration function deriving
 * from a FormSchema is tasked to add labels and values to these fields;
 *
 * tag: 12 will become tag { id: 12, label: 'exhibition' }
 */

async function _loadCustomDataParser( agendaUid, { agenda } ) {

  if ( !agenda ) {

    agenda = await _getAgenda( agendaUid );

  }

  if ( !agenda ) {

    log( 'error', 'agenda of uid %s was not found', agendaUid );

    return;

  }

  if ( !agenda.formSchemaId ) {

    log( 'no FormSchema is associated to agenda of uid %s', agenda.uid );

    return;

  }

  const formSchema = await formSchemas.get( agenda.formSchemaId );

  if ( !formSchema ) {

    log( 'warning', 'no FormSchema of id %s was found for agenda of uid %s', agenda.formSchemaId, agenda.uid );

    return;

  }

  const decorate = getDecorate( formSchema.fields );

  return e => e.custom ? ih( e, { custom: { $set: decorate( e.custom ) } } ) : e;

}


function _getAgenda( agendaUid ) {

  return new Promise( ( rs, rj ) => {

    agendas.get( { uid: agendaUid }, { internal: true }, ( err, agenda ) => {

      if ( err ) return rj( err );

      rs( agenda );

    } );

  } );

}