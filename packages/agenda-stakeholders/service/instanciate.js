"use strict";

const validators = require( 'validators' ),

utils = require( 'utils' ),

w = require( 'when' ),

slug = require( 'slug' ),

logger = require( 'basic-logger' );

var knex, schemas, log;

module.exports = instanciate;

module.exports.init = init;

function instanciate( agendaService ) {

  return function( data ) {

    let stakeholder = utils.extend( {}, data );

    return {

      // get current stakeholder validity state with eventual validation errors
      isValid: isValid,

      // retrieve field values
      getFieldValues: getFieldValues,

      // set field values
      setFieldValues: setFieldValues

    }

    function isValid( cb ) {

      getFieldValues( ( err, fields, result ) => {

        if ( err ) return cb( err );

        cb( null, result.valid, result.errors );

      } );

    }

    /**
     * set field values
     */
    function setFieldValues( fieldValues, options, cb ) {

      if ( arguments.length === 2 ) {

        cb = options;
        options = {};

      }

      let params = Object.assign( {
        force: false // force set of field values and ignore validation
      }, options );

      agendaService.settings.custom.validate( fieldValues, ( err, result ) => {

        if ( err ) return cb( err );

        if ( !params.force && !result.valid ) {

          return cb( null, false, result.errors );

        }

        agendaService.settings.custom.toValues( result.clean, ( err, values ) => {

          should( err ).equal( null );

          stakeholder.custom = values;

          _save( cb );

        } );

      } );

    }

    /**
     * extract field values from custom data
     */
    
    function getFieldValues( cb ) {

      agendaService.settings.custom.toFields( stakeholder.custom, ( err, fieldValues, settings ) => {

        if ( err ) return cb( err );

        agendaService.settings.custom.validate( fieldValues, ( err, result ) => {

          if ( err ) return cb( err );

          cb( null, fieldValues, result );

        } );

      } );

    }

    /**
     * commit to db current stakeholder state
     */
    function _save( cb ) {

      stakeholder.updatedAt = new Date();

      if ( _isNew() ) {

        stakeholder.createdAt = new Date();

      }

      let entry = format.objToDb( stakeholder );

      // save it to db with knex
      knex.transaction( trx => {

        let op;

        if ( _isNew() ) {

          op = trx.insert( stakeholder );

        } else {

          op = trx.update( stakeholder )

          .where( { id: stakholder.id } );

        }

        return op;

      } )

      .done( () => {

        cb( null );

      }, cb );

    }


    function _isNew() {

      return !!stakeholder.id;

    }

    
    /**
     * prepare field values for a commit to db
     * ( camel cased, with slugs when required )
     */
    function _prepareFieldValues( cb ) {

      getFieldValues( ( err, fieldValues, valid, settings ) => {

        if ( err ) return cb( err );

        let decorated = {};

        Object.keys( fieldValues ).forEach( k => {

          let fieldSettings = settings.fields.filter( f => f.field === k );

          if ( !fieldSettings.length ) return;

          if ( fieldSettings[ 0 ].slugged ) {

            decorated[ k ] = {
              label: fieldValues[ k ],
              slug: slug( fieldValues[ k ], { lower: true } )
            }

          } else {

            decorated[ k ] = fieldValues[ k ];

          }

        } );

        cb( null, decorated );

      } );

    }

  }

}

function init( config ) {

  log = logger( 'instanciate' );

  schemas = config.schemas;

  knex = config.knex;

}


/**
 * tell from settings whether field is slugged
 */
function _isFieldSlugged( fieldName, settings ) {
  
  let fieldSettings = settings.fields.filter( f => f.field === utils.toUnderscore( fieldName ) );

  if ( !fieldSettings.length ) return false;

  return !!fieldSettings[ 0 ].slugged;

}