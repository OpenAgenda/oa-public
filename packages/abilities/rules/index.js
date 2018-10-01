'use strict';

const _ = require( 'lodash' );
const { AbilityBuilder } = require( '@casl/ability' );
const config = require( '../config' );


const joinIfArray = ( value, delimiter = '|' ) => ( Array.isArray( value ) ? value.join( delimiter ) : value );
const splitIfNeeded = ( value, delimiter = '|' ) => {
  if ( typeof value === 'string' && value.includes( delimiter ) ) {
    return value.split( delimiter );
  }

  if ( Array.isArray( value ) && value.length === 1 ) {
    return value[ 0 ];
  }

  return value;
};

function format( rules ) {
  const _format = rule => ( {
    actions: joinIfArray( rule.actions ),
    subject: joinIfArray( rule.subject ),
    inverted: rule.inverted || false,
    conditions: rule.conditions ? JSON.stringify( rule.conditions ) : null,
    fields: joinIfArray( rule.fields ) || null,
    reason: rule.reason || null
  } );

  return Array.isArray( rules ) ? rules.map( _format ) : _format( rules );
}

function parse( rules ) {
  const _parse = rule => ( {
    actions: splitIfNeeded( rule.actions ),
    subject: splitIfNeeded( rule.subject ),
    inverted: !!rule.inverted,
    conditions: typeof rule.conditions === 'string' ? JSON.parse( rule.conditions ) : ( rule.conditions || null ),
    fields: splitIfNeeded( rule.fields ) || null,
    reason: rule.reason || null
  } );

  return Array.isArray( rules ) ? rules.map( _parse ) : _parse( rules );
}

async function list( entityName, identifier ) {
  if ( !_.isString( entityName ) ) {
    throw new TypeError( '`entityName` should be a string' );
  }

  if ( !_.isNumber( identifier ) ) {
    throw new TypeError( '`identifier` should be a number' );
  }

  const rules = await config
    .knex( config.schemas.rule )
    .select()
    .where( {
      entity_name: entityName,
      identifier
    } );

  return parse( rules );
}

function getDefaultFor( entityName ) {
  const defaultForFn = config.interfaces && config.interfaces.defaultFor && config.interfaces.defaultFor[ entityName ];
  const builder = AbilityBuilder.extract();

  return defaultForFn ? defaultForFn( builder ) : [];
}


module.exports = {
  list,
  format,
  parse,
  getDefaultFor
};
