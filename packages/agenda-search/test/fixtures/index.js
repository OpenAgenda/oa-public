"use strict";

var mysql = require( 'mysql' ),

fs = require( 'fs' ),

utils = require( 'utils' ), 

config = JSON.parse( JSON.stringify( require( '../../testconfig' ) ) ),

database = config.mysql.database,

sql = {
  reset: fs.readFileSync( __dirname + '/reset.sql' ).toString(),
  data: fs.readFileSync( __dirname + '/data.sql' ).toString()
},

w = require( 'when' );

delete config.mysql.database;


/**
 * build test db
 */

module.exports = function( cb ) {

  w( {
    con: _getConnection()
  })

  // create the agenda schema
  .then( v => {

    return _query( v, 
      sql.reset
      .replace( /\${schema}/g, config.schemas.agenda )
      .replace( /\${database}/g, database )
    );

  } )

  // populate the agenda schema
  .then( v => {

    _query( v, 
      sql.data
      .replace( /\${schema}/g, config.schemas.agenda )
    );

  } )

  .done( () => cb(), cb );

}

function _query( v, sql ) {
  
  let d = w.defer();

  v.con.query( 
    sql,
    err => err ? d.reject( err ) : d.resolve( v ) 
  );

  return d.promise;

}

function _getConnection() {

  return mysql.createConnection( utils.extend( {
    multipleStatements: true
  }, config.mysql ) );

}