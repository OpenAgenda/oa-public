"use strict";

const should = require( 'should' ),

  service = require( './service' ),

  config = require( '../testconfig' ),

  mysql = require( 'mysql' ),

  _ = require( 'lodash' );

describe( 'unsubscribed - functional: .remove', function() {

  before( done => {

    service.initAndLoad( config, done );

  } );

  it( 'simple remove', done => {

    service( 12345678 ).add( {
      type: 'some.type',
      subject: 'agenda',
      identifier: 2
    }, ( err, result ) => {

      const con = mysql.createConnection( config.mysql );

      con.query( 'select count(id) as c from unsubscribed', ( err, rows ) => {

        rows[ 0 ].c.should.equal( 5 );

        service( 12345678 ).remove( {
          type: 'some.type',
          subject: 'agenda',
          identifier: 2
        }, ( err, result ) => {

          result.success.should.equal( true );

          result.deletedCount.should.equal( 1 );

          con.query( 'select count( id ) as c from unsubscribed', ( err, rows ) => {

            rows[ 0 ].c.should.equal( 4 );

            done();

          } );

        } );

      } );

    } );

  } );

} );