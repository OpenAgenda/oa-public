"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const agendas = require( '@openagenda/agendas' );
const schema = require( '@openagenda/validators/schema' );
const formSchemas = require( '@openagenda/form-schemas' );
const makeTransform = require( '@openagenda/stream-utils' ).transform;
const getDecorate = require( '@openagenda/form-schemas/iso/getDecorate' );
const log = require( '@openagenda/logs' )( 'services/eventSearch/agendaIndexSearch' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' ),
  pass: require( '@openagenda/validators/pass' ),
  text: require( '@openagenda/validators/text' )
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
  },
  aggregations: {
    type: 'pass',
    default: null
  },
  monolingual: {
    type: 'text',
    list: { max: 2 }
  }
} );


module.exports = async (searchIndex, agendaUid, query, nav, options = {}) => {

  const { searchOptions, parseEvent } = await _prepare( agendaUid, options );

  return searchIndex.search( query, nav, searchOptions )

    .then( ( { events, total, aggregations } ) => ( {
      total,
      events: events.map( parseEvent ),
      aggregations
    } ) );

}


module.exports.moreLikeThis = async ( searchIndex, sample, options ) => {

  // do it on keywords, title, custom ids, custom text.
  return searchIndex.moreLikeThis( sample, options, {
    date: {
      gte: JSON.stringify( new Date() ).split( 'T' )[ 0 ],
      timezone: 'Europe/Paris'
    }
  } );

}


module.exports.stream = async ( searchIndex, agendaUid, query, options = {} ) => {

  const { searchOptions, parseEvent } = await _prepare( agendaUid, options );

  const stream = searchIndex.search.stream( query, searchOptions );

  return stream.pipe( makeTransform( parseEvent ) );

}


async function _prepare( agendaUid, options ) {

  const cleanOptions = validateOptions( options );

  let searchOptions = _.extend( _.pick( cleanOptions, [
    'detailed',
    'aggregations',
    'monolingual'
  ] ), {
    extensions: [
      'contributor',
      'state',
      'featured'
    ]
  } );

  let parseEvent = e => e;

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

  return { searchOptions, parseEvent };

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

    agenda = await agendas.get( { uid: agendaUid }, { internal: true } );

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
