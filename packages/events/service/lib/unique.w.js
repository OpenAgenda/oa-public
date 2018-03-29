"use strict";

const w = require( 'when' );

const verifyUnique = require( '@openagenda/mysql-utils/verifyUnique' );
const defineUnique = require( '@openagenda/mysql-utils/defineUnique' );

const { promisify } = require( 'util' );

const map = require( '../databaseFieldMap' );
const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );

module.exports = {
  verify,
  define: defineUnique,
  promiseDefine,
  promiseVerify
}


function promiseVerify( params, cb ) {

  return new Promise( ( rs, rj ) => {

    verifyUnique( params, ( err, is ) => {

      if ( err ) return rj( err );

      rs( is );

    } );

  } );

}


function promiseDefine( params, genFn ) {

  return new Promise( ( rs, rj ) => {

    defineUnique( params, genFn, ( err, uniqueValue ) => {

      if ( err ) return rj( err );

      rs( uniqueValue );

    } );

  } );

}

function verify( { mysql, table, field, log } ) {

  return v => {

    log( 'verifying unique %s', field );

    let d = w.defer(),

    // value checked for unicity is from data for create
    // from merged values in case of update
    value = dbParse.toDb( v.id ? v.merged : v.data )[ field ];

    verifyUnique( {
      table,
      field,
      value,
      exclude: v.id ? { id: v.id } : false,
      mysql
    }, ( err, is ) => {

      if ( err ) return d.reject( err );

      if ( is ) {

        log( '%s is unique', field );

        return d.resolve( v );

      }

      log( '%s is not unique', field );

      v.errors.push( {
        field,
        code: 'duplicate',
        message: 'duplicate value found',
        origin: value
      } );

      return d.resolve( v );

    } );

    return d.promise;

  }

}