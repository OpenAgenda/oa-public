"use strict";

/**
 * agenda stakeholder settings; field requirements, mainly.
 */

var knex, schemas,

utils = require( 'utils' ),

logger = require( 'basic-logger' ), log,

w = require( 'when' ),

storeLib = require( 'mysql-table-store' ), store,

validators = require( 'validators' ),

defaultSettings = {
  fields: []
},

/**
 * legacy fields are just names.
 * the validators settings are given here
 */
legacyFields = [ { 
  field: 'organization',
  type: 'text',
  params: { min: 2, max: 160 }
}, {
  field: 'contact_number',
  type: 'phone',
  params: {}
}, {
  field: 'contact_name',
  type: 'text',
  params: { min: 2, max: 160 }
}, {
  field: 'contact_position',
  type: 'text',
  params: { min: 2, max: 160 }
}, {
  field: 'email',
  type: 'email',
  params: {}
} ];

module.exports = settings;

module.exports.init = init;


function settings( agendaId ) {

  return {
    get: get,
    set: set
  }
  
  function get( cb ) {

    store.get( agendaId, ( err, settings ) => {
      
      if ( err ) return cb( err );

      if ( settings ) return cb( null, settings );

      _getFromLegacy( agendaId, cb );

    } );

  }
  
  function set( settings, cb ) {

    let errors = _validate( settings.fields );

    if ( errors.length ) return cb( err );

    store.set( agendaId, settings, cb );

  }

}


/**
 * yo dawg, you want to validate the validation data
 */
function _validate( fields ) {

  let errors = [];

  fields.forEach( ( f, i ) => {

    try {

      if ( f.field === undefined ) {

        throw 'field attribute is not set at index ' + i;

      }

      if ( f.type === undefined ) {

        throw 'field type is not set at index ' + i;

      }

    } catch( e ) {

      errors.push( e );

    }

  } );

  return errors;

}

function _getFromLegacy( agendaId, cb ) {

  knex.transaction( trx => trx.select( 'store' )

    .from( schemas.agenda )

    .where( {
      id: agendaId
    } )

    .limit( 1 ).offset( 0 ) )

  .then( rows => {

    let store = {},

    s = utils.extend( {}, defaultSettings );

    if ( !rows.length ) {

      return s;

    }

    try {

      store = JSON.parse( rows[ 0 ].store );

    } catch( e ) {

      log( 'error', 'could not parse store: %s', rows[ 0 ].store );

      return s;

    }

    if ( !store.cFields ) {

      return s;

    }

    return utils.extend( {}, defaultSettings, {
      
      fields: Object.keys( store.cFields )
        .map( f => legacyFields.filter( lf => lf.field == f )[ 0 ] )

    } );

  } )

  .done( settings => cb( null, settings ), cb );

}


function init( config ) {

  let d = w.defer();

  schemas = config.schemas;

  knex = config.knex;

  storeLib( utils.extend( {
    table: config.schemas.stakeholderSettings,
  }, config.mysql ), ( err, s ) => {

    if ( err ) return d.reject( err );

    store = s;

    d.resolve();

  } );

  return d.promise;

}