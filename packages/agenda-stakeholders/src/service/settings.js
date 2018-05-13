"use strict";

/**
 * agenda stakeholder settings; field requirements, mainly.
 */

const utils = require( '@openagenda/utils' ),

  logger = require( '@openagenda/logs' ),

  storeLib = require( '@openagenda/mysql-table-store' ),

  w = require( 'when' ),

  validator = require( '../iso/validator' ),

  customFormat = require( './customFormat' ),

  defaultFields = require( '../iso/defaults' ).fields,

  legacyLib = require( './legacy' );

let knex, schemas, log, store;

module.exports = Object.assign( settings, { init } );

function settings( agendaId ) {

  const legacy = legacyLib( agendaId );

  return {
    
    get,
    set,
    setDefault,
    clear,

    custom: {
      validate: validateCustomValues,
      toValues: toCustomValues,
      toFields: toCustomFields
    }

  }

  
  function get( cb ) {

    store.get( agendaId, ( err, settings ) => {

      if ( err ) return cb( err );

      if ( settings ) return cb( null, settings );

      legacy.get( cb );

    } );

  }


  function setDefault( cb ) {

    store.set( agendaId, { fields: defaultFields }, err => {

      if ( err ) return cb( err );

      legacy.setDefault( cb );

    } );

  }

  
  function set( settings, cb ) {

    let errors = _validate( settings.fields );

    if ( errors.length ) return cb( err );

    store.set( agendaId, settings, cb );

  }


  function clear( clearLegacy, cb ) {

    if ( arguments.length !== 2 ) {

      cb = clearLegacy;
      clearLegacy = true

    }

    store.set( agendaId, null, err => {

      if ( err ) return cb( err );

      if ( clearLegacy ) {

        legacy.clear( cb );

      } else {

        cb();

      }

    } );

  }



  function toCustomFields( data, cb ) {

    get( ( err, settings ) => {

      if ( err ) return cb( err );

      cb( null, customFormat.getFieldValues( data, settings ), settings );

    } );

  }

  function toCustomValues( data, cb ) {

    get( ( err, settings ) => {

      if ( err ) return cb( err );

      cb( null, customFormat.getValues( data, settings ) );

    } );

  }


  function validateCustomValues( values, cb ) {

    _getCustomValidator( ( err, validator, settings ) => {

      if ( err ) return cb( err );

      let errors = [], clean = undefined;

      try {

        let dirty = {}; 

        Object.keys( values ).map( k => {

          dirty[ k ] = typeof values[ k ] === 'object' ? values[ k ].label : values[ k ];

        } );

        clean = validator( dirty );

      } catch( e ) {

        errors = e;

      };

      cb( null, {
        valid: !errors.length,
        clean,
        errors,
        settings
      } );

    } );

  }

  /**
   * fields validator validates a stakeholder custom fields set
   */

  function _getCustomValidator( cb ) {

    get( ( err, settings ) => {

      if ( err ) return cb( err );

      cb( null, validator( settings.fields ), settings );

    } );

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


function init( config ) {

  let d = w.defer();

  schemas = config.schemas;

  knex = config.knex;

  storeLib( {
    table: config.schemas.stakeholderSettings,
    promisedQuery: ( query, values ) => knex.raw( query, values ).then( result => result[ 0 ] )
  }, ( err, s ) => {

    if ( err ) return d.reject( err );

    store = s;

    d.resolve();

  } );

  return d.promise;

}