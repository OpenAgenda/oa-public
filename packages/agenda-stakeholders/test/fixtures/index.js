"use strict";

var mysql = require( 'mysql' ),

fs = require( 'fs' ),

utils = require( 'utils' ), 

config,

database,

sql = {
  reset: 'drop database if exists ${database}; create database ${database}; use ${database};',
  data: {
    agenda: fs.readFileSync( __dirname + '/agenda.data.sql' ).toString(),
    event: fs.readFileSync( __dirname + '/event.data.sql' ).toString(),
    agendaEvent: fs.readFileSync( __dirname + '/agendaEvent.data.sql' ).toString(),
    stakeholder: fs.readFileSync( __dirname + '/stakeholder.data.sql' ).toString(),
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

  // populate the event schema
  .then( v => {

    return _query( v, 
      sql.data.event
      .replace( /\${schema}/g, config.schemas.event )
    );

  } )


  // populate the stakeholder schema
  .then( v => {

    return _query( v, 
      sql.data.stakeholder
      .replace( /\${schema}/g, config.schemas.stakeholder )
    );

  } )

  // populate the agendaEvent schema
  .then( v => {

    return _query( v, 
      sql.data.agendaEvent
      .replace( /\${schema}/g, config.schemas.agendaEvent )
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