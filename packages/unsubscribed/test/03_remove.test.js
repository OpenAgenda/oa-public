"use strict";

const service = require( './service' ),

  config = require( '../testconfig' ),

  mysql = require( 'mysql' ),

  _ = require( 'lodash' );

describe( 'unsubscribed - functional: .remove', function() {

  beforeAll( done => {

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

        expect(rows[ 0 ].c).toBe( 6 );

        service( 12345678 ).remove( {
          type: 'some.type',
          subject: 'agenda',
          identifier: 2
        }, ( err, result ) => {

          expect(result.success).toBe(true);

          expect(result.deletedCount).toBe( 1 );

          con.query( 'select count( id ) as c from unsubscribed', ( err, rows ) => {

            expect(rows[ 0 ].c).toBe( 5 );

            done();

          } );

        } );

      } );

    } );

  } );


  it( 'remove without identifier', done => {

    service( 12345678 ).add( {
      type: 'notifications_summary',
      subject: 'notifications',
    }, ( err, result ) => {

      service( 12345678 ).remove( {
        type: 'notifications_summary',
        subject: 'notifications',
      }, ( err, result ) => {

        expect(result.success).toBe(true);

        expect(result.deletedCount).toBe( 1 );

        done();

      } );

    } );

  } );

} );