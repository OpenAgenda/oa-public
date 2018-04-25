"use strict";

var mysql = require( 'mysql' ),

fs = require( 'fs' ),

utils = require( '@openagenda/utils' ),

dbConfig = utils.extend( {}, require( '../../testconfig.js' ).mysql ),

tableName = dbConfig.table,

agendaSettingsTableName = dbConfig.agendaSettingsTableName,

agendaSettings = require( './agendaTestSettings.js' ),

dbName = dbConfig.database,

utils = require( '@openagenda/utils' );

delete dbConfig.database;
delete dbConfig.table;

module.exports = function( agendaId, fixtureSet, reset, cb ) {

  if ( arguments.length == 3 ) {

    cb = reset;

    reset = false;

  } else if ( arguments.length == 2 ) {

    cb = fixtureSet;

    reset = true;

    fixtureSet = '1';

  }

  var con = _getConnection(),

  queries = [];

  if ( reset ) {

    queries = queries.concat( [
      `drop database if exists ${dbName}`, 
      `create database ${dbName}`,
      `use ${dbName}`,
      `CREATE TABLE IF NOT EXISTS ${tableName}
        (id BIGINT AUTO_INCREMENT,
        uid BIGINT UNIQUE,
        agenda_id bigint,
        slug VARCHAR(100) NOT NULL UNIQUE,
        placename VARCHAR(100) NOT NULL,
        address VARCHAR(255),
        city VARCHAR(100),
        country VARCHAR(2),
        latitude DECIMAL(10, 6) NOT NULL,
        longitude DECIMAL(10, 6) NOT NULL,
        owner_id BIGINT NOT NULL,
        main TINYINT(1) DEFAULT '0' NOT NULL,
        store LONGTEXT,
        processed_at datetime,
        region VARCHAR(255),
        department VARCHAR(255),
        city_district VARCHAR(255),
        postal_code VARCHAR(20),
        insee VARCHAR(10),
        eve_id VARCHAR(100),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL, 
        UNIQUE INDEX slug_idx (slug), 
        INDEX latlng_idx (latitude, longitude),
        INDEX owner_id_idx (owner_id),
        PRIMARY KEY(id)) DEFAULT CHARACTER 
        SET utf8 COLLATE utf8_general_ci ENGINE = INNODB`, 
        `delete from ${tableName}`,
      `CREATE TABLE IF NOT EXISTS ${agendaSettingsTableName}
        (agenda_id BIGINT UNIQUE NOT NULL,
        store LONGTEXT,
        PRIMARY KEY(agenda_id)) DEFAULT CHARACTER
        SET utf8 COLLATE utf8_general_ci ENGINE = INNODB`, 
        `delete from ${agendaSettingsTableName}`
    ] );

  } else {

    queries.push( `use ${dbName}` );

  }

  queries.push( _read( fixtureSet, agendaId ) );

  con.query( queries.join( ';' ), ( err ) => {

    con.end();

    cb( err );

  } );

}

function _read( fixtureSet, agendaId ) {

  var con = _getConnection();

  var qstr = fs.readFileSync( __dirname + '/' + fixtureSet, 'utf-8' )

  .replace( '${tableName}', tableName )

  .replace( '${dbName}', dbName )

  .replace( '${agendaSettingsTableName}', agendaSettingsTableName )

  .replace( '${agendaSettings}', con.escape( JSON.stringify( agendaSettings ) ) )

  .replace( /\$\{agendaId\}/g, agendaId );

  con.end();

  return qstr;

}


function _getConnection() {

  return mysql.createConnection( utils.extend( {
    multipleStatements: true
  }, dbConfig ) );

}