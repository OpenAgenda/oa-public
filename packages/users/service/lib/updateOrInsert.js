"use strict";

const w = require( 'when' );
const defineUnique = require( '@openagenda/mysql-utils/defineUnique' );
const config = require( '../../config' );
const validators = require( './validators' );
const get = require( '../get' );

module.exports = function _updateOrInsert( v ) {

  const { knex, schemas } = config;

  if ( v.errors.length ) return v;

  var d = w.defer();

  const detailed = v.params && v.params.detailed;

  get( v.query, { detailed, store: true }, ( err, user ) => {

    if ( err ) return d.reject( err );

    var mode = user && ( v.query.id || v.query.uid ) ? 'update' : 'insert',

      identifiers = Object.keys( v.identifier ),

      validator = mode == 'update' ?
        validators.update( v.query, v.params && v.params.protected, v.action == 'remove' ) :
        validators( v.query, v.params && v.params.protected ),

      fields = validator.fields;


    v.valid = validator.valid;

    if ( !user && ( v.query.id || v.query.uid ) ) {

      return d.resolve( v );

    }

    if ( !v.valid ) {

      v.errors = validator.errors;
      return d.resolve( v );

    }

    return new Promise( ( resolve, reject ) => {

      fields.updated_at = new Date();

      if ( mode == 'insert' ) {

        fields.created_at = new Date();

        return defineUnique( {
          table: schemas.user,
          field: 'uid',
          mysql: config.mysql
        }, () => Math.ceil( Math.random() * 99999999 ), ( err, uniqueValue ) => {

          if ( err ) reject( err );

          fields.uid = uniqueValue;
          resolve();

        } );

      }

      resolve();

    } )
      .then( () => knex.transaction( trx => {

        var queryBuilder = knex( schemas.user )[ mode ]( fields );

        if ( mode == 'update' ) {

          queryBuilder.where( identifiers[ 0 ] || 'id', v.identifier[ identifiers[ 0 ] ] || -1 )

        }

        return queryBuilder.transacting( trx );

      } ) )

      .then( result => {

        v.user = typeof result == 'number' ? Object.assign( user, fields ) : { id: result[ 0 ] };

        v.success = true;

        return d.resolve( v );

      }, err => {

        return d.reject( err );

      } );

  } );

  return d.promise;

}
