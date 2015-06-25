"use strict";

var dbConfig,

utils = require( 'utils' ),

mysql = require( 'mysql' );

module.exports = {
  init: init,
  get: get,
  set: set
}

function init( config, cb ) {

  if ( arguments.length == 1 ) {

    cb = config;

  } else {

    dbConfig = utils.extend( {
      host: 'localhost',
      user: 'root',
      password: false,
      database: 'emailstrategie',
      table: 'emailstrategie'
    }, config );

  }

  _checkSchema( cb );

}

function set( values, cb ) {

  if ( !values.id ) {

    _create( values, cb );    

  } else {

    _update( values.id, values, cb );

  }

}

function get( id, cb ) {

  var con = _createConnection();

  con.query( 'select login, password, list_ids from ' + dbConfig.table + ' where id = ?', function( err, rows ) {

    if ( err ) return cb( err );

    if ( !rows.length ) return cb( null, null );

    cb( null, {
      id: id,
      login: rows[ 0 ].login,
      password: rows[ 0 ].password,
      listIds: rows[ 0 ].list_ids ? JSON.parse( rows[ 0 ].list_ids ) : []
    } );

  });
  
}

function _update( id, data, cb ) {

  var clean = utils.extend( {
    login: null,
    password: null,
    listIds: null
  }, data ),

  con = _createConnection(),

  query = 'update ' + dbConfig.table + ' set';

  if ( clean.login !== null ) query += ' login = ' + con.escape( clean.login );
  if ( clean.password !== null ) query += ' password = ' + con.escape( clean.password );

  if ( clean.listIds !== null ) query += ' list_ids = ' + JSON.stringify( clean.listIds );

  query += ' where id = ' + id;

  con.query( query, function( err, result ) {

    con.end();

    if ( err ) return cb( err );

    cb( null, result.changedRows === 1 );

  });

}

function _create( data, cb ) {

  var clean = utils.extend( {
    login: '',
    password: '',
    listIds: []
  }, data ),

  con = _createConnection();

  con.query( 
    'insert into ' + dbConfig.table + ' ( login, password, list_ids ) values ( ?, ?, ? )',
    [ clean.login, clean.password, JSON.stringify( clean.listIds ) ],
    function( err, result ) {

      con.end();

      if ( err ) return cb( err );

      cb( null, result.insertId );

    } );

}

function _checkSchema( cb ) {

  // create schema if not found
  var con = _createConnection( false );

  con.query( 'create database if not exists ' + dbConfig.database, function( err ) {

    if ( err ) return cb( err );

    con.end();

    con = _createConnection();

    con.query( [ 'create table if not exists ', dbConfig.table,' (', 
      'id bigint auto_increment,',
      'login varchar(100),',
      'password varchar(100),',
      'list_ids varchar(1000),',
      'unique index id_idx (id),',
      'primary key(id)',
      ') default character set utf8 collate utf8_general_ci engine = innodb'
    ].join( ' ' ), function( err ) {

      con.end();

      cb( err );

    } );

  });

}

function _createConnection( useDb ) {

  if ( useDb === undefined ) useDb = true;

  var conParams = {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  };

  if ( useDb ) conParams.database = dbConfig.database;

  return mysql.createConnection( conParams );

}