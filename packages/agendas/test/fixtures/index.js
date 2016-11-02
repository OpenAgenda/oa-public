"use strict";

var mysql = require( 'mysql' ),

fs = require( 'fs' ),

utils = require( 'utils' ), 

config,

database,

sql = {
  reset: fs.readFileSync( __dirname + '/reset.sql' ).toString(),
  data: {
    agenda: fs.readFileSync( __dirname + '/agenda.data.sql' ).toString(),
    agendaEvent: fs.readFileSync( __dirname + '/agendaEvent.data.sql' ).toString(),
    occurrence: fs.readFileSync( __dirname + '/occurrence.data.sql' ).toString(),
    legacyCredentialSet: fs.readFileSync( __dirname + '/legacyCredentialSet.data.sql' ).toString()
  }
},

w = require( 'when' );

/**
 * build test db
 */

module.exports = build;

module.exports.init = c => { 

  config = JSON.parse( JSON.stringify( c ) );

  database = config.mysql.database;

  delete config.mysql.database;

};


function build( cb ) {

  w( {
    con: _getConnection()
  } )

  // create the agenda schema
  .then( v => {

    return _query( v, 
      sql.reset
      .replace( /\${agendaSchema}/g, config.schemas.agenda )
      .replace( /\${agendaEventSchema}/g, config.schemas.agendaEvent )
      .replace( /\${occurrenceSchema}/g, config.schemas.occurrence )
      .replace( /\${legacyCredentialSchema}/g, config.schemas.legacyCredentialSet )
      .replace( /\${database}/g, database )
    );

  } )

  // populate the agenda schema
  .then( v => {

    return _query( v, 
      sql.data.agenda
      .replace( /\${schema}/g, config.schemas.agenda )
    );

  } )

  // populate the occurrence schema
  .then( v => {

    return _query( v, 
      sql.data.occurrence
      .replace( /\${schema}/g, config.schemas.occurrence )
    );

  } )

  // populate the agendaEvent schema
  .then( v => {

    return _query( v, 
      sql.data.agendaEvent
      .replace( /\${schema}/g, config.schemas.agendaEvent )
    );

  } )

  // populate legacy credential table
  .then( v => {

    return _query( v, 
      sql.data.legacyCredentialSet
      .replace( /\${schema}/g, config.schemas.legacyCredentialSet )
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