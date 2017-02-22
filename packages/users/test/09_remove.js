"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.set', function () {

  this.timeout( 20000 );

  before( done => {

    fixtures.init( config );

    fixtures( [ {
      table: config.schemas.user,
      src: __dirname + '/fixtures/user.data.sql'
    }, {
      table: config.schemas.apiKeySet,
      src: __dirname + '/fixtures/api_key_set.data.sql'
    } ], done );

  } );

  before( done => {

    service.init( config, done );

  } );

  it( 'delete user makes it unavailable through default get', done => {

    service.remove( { id: 119 }, ( err, success ) => {

      should( err ).equal( null );
      success.should.equal( true );

      service.get( { id: 119 }, ( err, user ) => {

        should( err ).equal( null );
        should( user ).equal( null );

        done();

      } );

    } );

  } );

  it( 'delete user nulls email and puts it in store', done => {

    service.remove( { id: 3589 }, ( err, success ) => {

      let con = mysql.createConnection( config.mysql );

      con.query( 'select * from user where id = ?', 3589, ( err, rows ) => {

        con.end();

        rows[ 0 ].store.should.equal( '{"email":"musiquedefe@gmail.com"}' );

        should( rows[ 0 ].email ).equal( null );

        done();

      } );

    } );

  } );

} );
