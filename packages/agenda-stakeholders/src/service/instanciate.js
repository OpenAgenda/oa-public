"use strict";

const validators = require( '@openagenda/validators' ),

  _ = require( 'lodash' ),

  w = require( 'when' ),

  slug = require( 'slug' ),

  logger = require( '@openagenda/logs' ),

  format = require( './format' );

let knex, schemas, log;

module.exports = instanciate;

module.exports.init = init;

function instanciate( agendaService ) {

  return function( data ) {

    let stakeholder = _.extend( {
      custom: {}
    }, data );

    return {

      // get current stakeholder validity state with eventual validation errors
      isValid,

      // retrieve field values
      getFieldValues,

      // set field values
      setFieldValues,

      save

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
        force: false, // force set of field values and ignore validation
        save: true
      }, options );

      let underscored = _.mapKeys( fieldValues, ( v, k ) => _.snakeCase( k ) );

      agendaService.settings.custom.validate( underscored, ( err, result ) => {

        if ( err ) return cb( err );

        if ( !params.force && !result.valid ) {

          return cb( null, {
            success: false,
            valid: false,
            errors: result.errors
          } );

        }

        // no clean values is returned if data is not validated
        let toCommit = params.force && !result.valid ? fieldValues : result.clean;

        agendaService.settings.custom.toValues( toCommit, ( err, values ) => {

          if ( err ) return cb( err );

          stakeholder.custom = values;

          if ( !params.save ) return cb( null );

          save( { force: true }, err => {

            if ( err ) return cb( err );

            cb( null, {
              success: true,
              valid: result.valid,
              errors: result.errors,
              data: values
            } );

          } );

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
    function save( options, cb ) {

      if ( arguments.length == 1 ) {

        cb = options;

        options = {};

      }

      w( _.extend( {
        force: false,
        valid: null,
        saved: false
      }, options ) )

      // validate custom fields
      .then( v => {

        if ( v.force ) return v;

        let d = w.defer();

        isValid( ( err, is, errors ) => {

          if ( err ) return d.reject( err );

          v.valid = is;

          v.errors = errors;

          d.resolve( v );

        } );

        return d.promise;

      } )

      // execute update
      .done( v => {

        if ( !v.force && !v.valid ) {

          return cb( null, {
            saved: false,
            valid: false,
            errors: v.errors
          } );

        }

        stakeholder.updatedAt = new Date();

        if ( _isNew() ) {

          stakeholder.createdAt = new Date();

        }

        let op = knex.from( schemas.stakeholder );

        if ( _isNew() ) {

          op.insert( format.objToDb( stakeholder ) );

        } else {

          op.update( format.objToDb( stakeholder ) )

          .where( { id: stakeholder.id } );

        }

        op.asCallback( ( err, result ) => {

          if ( err ) return cb( err );

          if ( _isNew() ) {

            stakeholder.id = result[ 0 ];

          }

          cb( null, {
            saved: true,
            valid: v.valid,
            errors: v.errors,
            stakeholder: stakeholder
          } );

        } );
        
      }, cb );

    }


    function _isNew() {

      return !stakeholder.id;

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