"use strict";

var should = require( 'should' ),

mysql = require( 'mysql' ),

creds = require( './lib/creds' ),

dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'grut',
  database: 'emailstrategietest'
},

lib = require( '../' ),

itf = require( '../lib/interface' );

describe( 'create & delete account', function() {

  var account;

  beforeEach( _dropDb );

  beforeEach( function( done ) {

    lib.init( {
      database: dbConfig,
      redis: {} // defaults
    } );

    lib.linkAccount( creds.login, creds.password, function( err, a ) {

      account = a;

      done();

    } );

  });

  it( 'unlink', function( done ) {

    var cli = _cli();

    cli.query( 'select id from account where id = ?', account.id, function( err, rows ) {

      rows.length.should.equal( 1 );

      account.unlink( function( err ) {

        should( err ).equal( null );

        cli.query( 'select id from account where id = ?', account.id, function( err, rows ) {

          rows.length.should.equal( 0 );

          done();

        });

      });

    }); 

  });

});


describe( 'create and remove list', function() {

  var account;

  beforeEach( _dropDb );

  beforeEach( function( done ) {

    lib.init( {
      database: dbConfig,
      redis: {} // defaults
    } );

    lib.linkAccount( creds.login, creds.password, function( err, a ) {

      account = a;

      done();

    } );

  });

  afterEach( function( done ) {

    account.unlink( done );

  });

  it( 'create list', function( done ) {

    account.createList( 'test list', [ 't1', 't2', 't3' ], function( err, list ) {

      should( err ).equal( null );

      itf.GetListByID( {
        token: list.token,
        listID: list.id
      }, function( err, result ) {

        result.name.should.equal( list.name );

        result.dynamicContentListsID.should.eql( list.id );

        done();

      });

    });

  } );

  it( 'remove list', function( done ) {

    account.createList( 'test list', [ 't1', 't2', 't3' ], function( err, list ) {

      var listId = list.id;

      list.remove( function( err ) {

        should( err ).equal( null );

        itf.GetListByID( {
          token: list.token,
          listID: list.id
        }, function( err, result ) {

          should( err ).equal( null );

          should( result ).equal( null );

          done();

        } );

      });

    });

  });


} );


function _dropDb( cb ) {

  var cli = mysql.createConnection( {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  } );

  cli.query( 'drop database if exists ' + dbConfig.database, function( err ) {

    cli.end();

    cb();

  } );

}

function _cli() {

  return mysql.createConnection( dbConfig );

}