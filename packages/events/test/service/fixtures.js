"use strict";

var mysql = require( 'mysql' ),

  fs = require( 'fs' ),

  utils = require( '@openagenda/utils' ),

  w = require( 'when' ),

  keys = require( 'when/keys' ),

  guard = require( 'when/guard' ),

  config,

  database,

  sql = {
    drop: 'drop database if exists ${database};',
    create: 'create database if not exists ${database};',
    use: 'use ${database};',
    data: {}
  },

  con;


module.exports = fix;

module.exports.getConnection = () => con;

module.exports.init = c => {

  config = JSON.parse( JSON.stringify( c ) );

  database = config.mysql.database;

  delete config.mysql.database;

  con = _getConnection();

};


function fix( list, options, cb ) {

  if ( arguments.length === 2 ) {
    cb = options;
    options = {};
  }

  const params = Object.assign( {}, {
    reset: true
  }, options );

  sql.data = {};

  list.forEach( elem => sql.data[ elem.table ] = fs.readFileSync( elem.src ).toString() );

  build( params, cb );

}


function build( params, cb ) {

  w( {} )

  // drop if pre-existing db
    .then( () => {

      if ( !params.reset ) return;

      return _query( con,
        sql.drop.replace( /\$\{database}/g, database )
      );

    } )

    // create the agenda schema
    .then( () => {

      if ( !params.reset ) return;

      return _query( con,
        sql.create.replace( /\$\{database}/g, database )
      );

    } )

    // select database to use
    .then( () => {

      return _query( con,
        sql.use.replace( /\$\{database}/g, database )
      );

    } )

    .then( () => {

      const guardedAsyncOperation = guard( guard.n( 1 ), ( sql, schema ) => {

        if ( !schema ) throw new Error( 'Missing table name' );

        return _query( con, sql.replace( /\$\{schema}/g, schema ) )
          .catch( err => {
            if ( process.env.NODE_ENV !== 'test' ) console.log( 'Error:', err );

            return Promise.reject( err );
          } );

      } );

      return keys.map( sql.data, guardedAsyncOperation );

    } )

    .done( () => {

      cb();

    }, err => {

      cb( err );

    } );

}


function _getConnection() {

  return mysql.createConnection( utils.extend( {
    multipleStatements: true
  }, config.mysql ) );

}

function _query( con, sql ) {

  let d = w.defer();

  con.query( sql, err => err ? d.reject( err ) : d.resolve() );

  return d.promise;

}
