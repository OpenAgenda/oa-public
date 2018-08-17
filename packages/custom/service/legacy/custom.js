"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'legacy/custom' );
const VError = require( 'verror' );

const config = require( '../config' );

module.exports = _.assign( set, {
  parse
} );

async function set( eventId, fields, data ) {

  if ( !fields.length ) return;

  const { knex } = config;
  const { schemas } = config.legacy;

  let current;

  log( 'info', 'getting custom from legacy event', { eventId } );

  try {

    const { custom } = await knex( schemas.event )
      .first( 'custom_fields as custom' )
      .where( { id: eventId } );

    current = custom && custom.length ? JSON.parse( custom ) : {};

  } catch ( e ) {

    log( 'error', 'failed to get custom from legacy event', { eventId, e } );

    throw new VError( e, 'could not parse custom fields from custom data of event of id %s', eventId );

  }

  const parsed = fields.reduce( ( parsed, f ) => {

    const matchingOption = f.options ? _.first( f.options.filter( o => o.id === data[ f.field ] ) ) : undefined;

    if ( !f.options ) {

      parsed[ f.field ] = data[ f.field ];

    } else if ( !matchingOption ) {

      log( 'warn', 'no matching option was found for data %s of event of id %s', f.field, eventId );

      parsed[ f.field ] = data[ f.field ];

    } else if ( matchingOption.value === 'true' ) {

      parsed[ f.field ] = true;

    } else if ( matchingOption.value === 'false' ) {

      parsed[ f.field ] = false;

    } else {

      parsed[ f.field ] = matchingOption.value;

    }

    return parsed;

  }, {} );

  log( 'info', 'updating legacy event custom_fields', { parsed } );

  const result = await knex( schemas.event ).update( { custom_fields: JSON.stringify( parsed ) } ).where( { id: eventId } );

  return !!result;

}

function parse( fields, custom ) {

  const legacyFields = _.keys( custom );

  const parsed = {};

  fields.filter( f => legacyFields.includes( f.field ) ).forEach( f => {

    const value = custom[ f.field ];

    if ( [ 'text', 'textarea' ].includes( f.fieldType ) ) {

      parsed[ f.field ] = value;

    } else {

      log( 'warn', 'unhandled transfer for type %s', f.fieldType || 'unspecified' );

    }

  } );

  return parsed;

}
