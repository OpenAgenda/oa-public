"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const log = require( '@openagenda/logs' )( 'set' );

const get = require( './get' );
const update = require( './update' );
const create = require( './create' );

let config, knex;

module.exports = _.extend( set, {
  init: ( c, k ) => { config = c; knex = k; }
} );

async function set( agendaUid, eventUid, data = {}, options = {} ) {

  log( 'info', 'initiating set', { agendaUid, eventUid, data, options } );

  if ( await get( agendaUid, eventUid ) ) {

    const result = await update( agendaUid, eventUid,
      _merge( data, 'update' ),
      _merge( options, 'update' )
    );

    if ( !result.success ) return result;

    return _.assign( _.omit( result, 'updated' ), {
      set: result.updated
    } );

  }

  const result = await create( agendaUid, eventUid,
    _merge( data, 'create' ),
    _merge( options, 'create' )
  );

  if ( !result.success ) return result;

  return _.assign( _.omit( result, 'created' ), {
    set: result.created
  } );

}


function _merge( options, operation ) {

  const override = _.get( options, operation );

  if ( !override ) return options;

  const updateObj = _.mapValues( override, ( v, k ) => ( { $set: v } ) );

  updateObj[ '$unset' ] = [ operation ];

  return ih( options, updateObj );

}
