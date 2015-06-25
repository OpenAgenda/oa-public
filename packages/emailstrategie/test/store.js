"use strict";

var should = require( 'should' ),

store = require( '../lib/store' ),

mysql = require( 'mysql' ),

dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'grut',
  database: 'emailstrategie'
}

describe( 'setting up', function() {

  beforeEach( _dropDb );

  it( 'init completes with created and database schema', function( done ) {

    store.init( dbConfig, function( err ) {

      should( err ).equal( null );

      var cli = mysql.createConnection( dbConfig );

      cli.query( 'select 1 from emailstrategie limit 1', function( err, rows ) {

        should( err ).equal( null );

        rows.length.should.equal( 0 );

        done();

      });

    });

  });

} );

describe( 'get and set', function() {

  beforeEach( _dropDb );

  beforeEach( function( done ) { store.init( dbConfig, done ); });

  it( 'set creates entry when id not specified', function( done ) {

    store.set( {
      login: 'gruut',
      password: 'enbrug',
      listIds: []
    }, function( err, result ) {

      should( err ).equal( null );

      var con = mysql.createConnection( dbConfig );

      con.query( 'select * from emailstrategie', function( err, rows ) {

        rows.length.should.equal( 1 );

        con.end();

        done();

      });

    } );

  });

  it( 'set updates when id is specified', function( done ) {

    var data = { login: 'yippi', password: 'kay', listIds: [ 'yeay' ] };

    store.set( data, function( err, id ) {

      store.set( { id: id, login: 'Yipi' }, function( err, result ) {

        should( err ).equal( null );

        result.should.equal( true );

        var con = mysql.createConnection( dbConfig );

        con.query( 'select * from emailstrategie', function( err, rows ) {

          con.end();

          rows.length.should.equal( 1 );

          rows[ 0 ].id.should.equal( id );

          rows[ 0 ].list_ids.should.equal( JSON.stringify( [ 'yeay' ] ) );

          rows[ 0 ].login.should.equal( 'Yipi' );

          done();

        } );

      });

    });

  });

});

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