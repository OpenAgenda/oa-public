"use strict";

const service = require( './service' ),

  config = require( '../testconfig' ),

  mysql = require( 'mysql' ),

  _ = require( 'lodash' );

describe( 'unsubscribed - functional: .clear', function() {

  beforeAll( done => {

    service.initAndLoad( config, done );

  } );

  it( 'simple .clear', done => {

    let userUid = 12345678;

    service( userUid ).add( { type: 'some.type', subject: 'a', identifier: 2 }, ( err, is ) => {

      service( userUid ).add( { type: 'some.type', subject: 'a', identifier: 3 }, ( err, is ) => {

        service( userUid ).clear( ( err, result ) => {

          expect(result.success).toBe( true );

          expect(result.deletedCount).toBe( 2 );

          done();

        } );        

      } );

    } );

  } );

} );