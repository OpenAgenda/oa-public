"use strict";

var dbConfig,

utils = require( 'utils' ),

mysql = require( 'mysql' );

module.exports = {
  init: init,
  get: get,
  set: set,
  del: del
}

function init( config, cb ) {

  if ( arguments.length == 1 && typeof config == 'function' ) {

    cb = config;

  } else {

    dbConfig = utils.extend( {
      host: 'localhost',
      user: 'root',
      password: false,
      database: 'emailstrategie',
      table: 'account'
    }, config );

    _checkSchema( cb );

  }

}

function set( values, cb ) {

  if ( !dbConfig ) return cb( 'store has not been initialized' );

  if ( !values.id ) {

    _create( values, cb );    

  } else {

    _update( values.id, values, cb );

  }

}

function get( id, cb ) {

  if ( !dbConfig ) return cb( 'store has not been initialized' );

  var con = _createConnection();

  con.query( 'select login, password, lists from ' + dbConfig.table + ' where id = ?', id, function( err, rows ) {

    var parsedLists = [];

    con.end();

    if ( err ) return cb( err );

    if ( !rows.length ) return cb( null, null );

    try {

      parsedLists = rows[ 0 ].lists ? JSON.parse( rows[ 0 ].lists ) : [];

    } catch( e ) {

      console.log( 'error', 'could not parse list: %s', rows[ 0 ].lists );

    }

    cb( null, {
      id: id,
      login: rows[ 0 ].login,
      password: rows[ 0 ].password,
      lists: parsedLists
    } );

  });
  
}

function del( id, cb ) {

  if ( !dbConfig ) return cb( 'store has not been initialized' );

  var con = _createConnection();

  con.query( 'delete from ' + dbConfig.table + ' where id = ?', id, function( err, result ) {

    con.end();

    return cb( err, result );

  } );

}

function _update( id, data, cb ) {

  if ( !dbConfig ) return cb( 'store has not been initialized' );

  var clean = utils.extend( {
    login: null,
    password: null,
    lists: null
  }, data ),

  con = _createConnection(),

  query = 'update ' + dbConfig.table + ' set ',

  set = [];

  if ( clean.login !== null ) set.push( 'login = ' + con.escape( clean.login ) );
  if ( clean.password !== null ) set.push( 'password = ' + con.escape( clean.password ) );
  if ( clean.lists !== null ) set.push( 'lists = ' + con.escape( JSON.stringify( clean.lists ) ) );

  query += set.join( ', ' ) + ' where id = ' + id;

  con.query( query, function( err, result ) {

    con.end();

    if ( err ) return cb( err );

    cb( null, result.changedRows === 1 );

  });

}

function _create( data, cb ) {

  if ( !dbConfig ) return cb( 'store has not been initialized' );

  var clean = utils.extend( {
    login: '',
    password: '',
    lists: []
  }, data ),

  con = _createConnection();

  con.query( 
    'insert into ' + dbConfig.table + ' ( login, password, lists ) values ( ?, ?, ? )',
    [ clean.login, clean.password, JSON.stringify( clean.lists ) ],
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

    con.end();

    if ( err ) return cb( err );

    con = _createConnection();

    con.query( [ 'create table if not exists ', dbConfig.table,' (', 
      'id bigint auto_increment,',
      'login varchar(100),',
      'password varchar(100),',
      'lists text,',
      'unique index id_idx (id),',
      'primary key(id)',
      ') default character set utf8 collate utf8_general_ci engine = innodb'
    ].join( ' ' ), function( err ) {

      con.end();

      if ( cb ) cb( err );

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