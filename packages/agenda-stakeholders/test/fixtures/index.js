"use strict";

var mysql = require( 'mysql' ),

fs = require( 'fs' ),

utils = require( 'utils' ), 

config,

database,

sql = {
  drop: 'drop database if exists ${database};',
  create: 'create database ${database}; use ${database};',
  data: {
    agenda: fs.readFileSync( __dirname + '/agenda.data.sql' ).toString(),
    event: fs.readFileSync( __dirname + '/event.data.sql' ).toString(),
    agendaEvent: fs.readFileSync( __dirname + '/agendaEvent.data.sql' ).toString(),
    stakeholder: fs.readFileSync( __dirname + '/stakeholder.data.sql' ).toString(),
    stakeholderSettings: fs.readFileSync( __dirname + '/stakeholderSettings.data.sql' ).toString()
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

  let con = _getConnection();

  w( {
    con: con
  } )

  // drop if pre-existing db
  .then( v => {

    return _query( v,
      sql.drop
      .replace( /\${database}/g, database )
    );

  } )

  // create the agenda schema
  .then( v => {

    return _query( v, 
      sql.create
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

  .then( v => {

    return _query( v, 
      sql.data.stakeholderSettings
      .replace( /\${schema}/g, config.schemas.stakeholderSettings )
    );

  } )

  .done( v => {

    v.con.end();

    cb()

  }, err => {

    if ( con ) con.end();

    cb( err );

  } );

}

function _query( v, sql ) {
  
  let d = w.defer();

  v.con.query( 
    sql,
    err => { 

      return err ? d.reject( err ) : d.resolve( v ) 

    }
  );

  return d.promise;

}

function _getConnection() {

  return mysql.createConnection( utils.extend( {
    multipleStatements: true
  }, config.mysql ) );

}

function _resetConnection( v ) {

  if ( !v.con ) return v;

  v.con.end();

  v.con = _getConnection();

  return v;

}