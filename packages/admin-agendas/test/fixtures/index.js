"use strict";

var mysql = require( 'mysql' ),

  fs = require( 'fs' ),

  utils = require( 'utils' ),

  config = JSON.parse( JSON.stringify( require( '../../testconfig' ) ) ),

  database = config.mysql.database,

  sql = {
    drop: 'drop database if exists ${database};',
    create: 'create database ${database}; use ${database};',
    data: {
      agenda: fs.readFileSync( __dirname + '/agenda.data.sql').toString(),
      event: fs.readFileSync( __dirname + '/event.data.sql').toString(),
      agendaEvent: fs.readFileSync( __dirname + '/agendaEvent.data.sql').toString(),
      occurrence: fs.readFileSync( __dirname + '/occurrence.data.sql').toString(),
      stakeholder: fs.readFileSync( __dirname + '/stakeholder.data.sql').toString(),
      stakeholderSettings: fs.readFileSync( __dirname + '/stakeholderSettings.data.sql' ).toString(),
      user: fs.readFileSync( __dirname + '/user.data.sql').toString()
    }
  },

  w = require( 'when' );

delete config.mysql.database;

module.exports = function( cb ) {

  w( {
    con: _getConnection()
  })

  // drop if pre-existing db
  .then( v => {

    return _query( v,
      sql.drop
      .replace( /\$\{database}/g, database )
    );

  } )

  // create the agenda schema
  .then( v => {

    return _query( v,
      sql.create
      .replace( /\$\{database}/g, database )
    );

  } )

  // populate the review schema
  .then( v => {

    console.log( 'populating agenda' );

    return _query( v,
      sql.data.agenda
      .replace( /\$\{schema}/g, config.schemas.agenda )
    );

  } )

  // populate the event schema
  .then( v => {

    console.log( 'populating event' );

    return _query( v,
      sql.data.event
      .replace( /\$\{schema}/g, config.schemas.event )
    );

  } )

  // populate the agendaEvent schema
  .then( v => {

    console.log( 'populating agendaEvent' );

    return _query( v,
      sql.data.agendaEvent
      .replace( /\$\{schema}/g, config.schemas.agendaEvent )
    );

  } )

  // populate the occurrence schema
  .then( v => {

    console.log( 'populating occurrence' );

    return _query( v,
      sql.data.occurrence
      .replace( /\$\{schema}/g, config.schemas.occurrence )
    );

  } )

  // populate the reviewer schema
  .then( v => {

    console.log( 'populating stakeholder' );

    return _query( v,
      sql.data.stakeholder
      .replace( /\$\{schema}/g, config.schemas.stakeholder )
    );

  } )

  // populate the reviewer schema
  .then( v => {

    console.log( 'populating stakeholderSettings' );

    return _query( v,
      sql.data.stakeholderSettings
      .replace( /\$\{schema}/g, config.schemas.stakeholderSettings )
    );

  } )

  // populate the user schema
  .then( v => {

    console.log( 'populating user' );

    return _query( v,
      sql.data.user
      .replace( /\$\{schema}/g, config.schemas.user )
    );

  } )

  .done( () => cb(), cb );
  
};

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