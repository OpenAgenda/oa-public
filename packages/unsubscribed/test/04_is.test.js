"use strict";

const service = require( './service' ),

  config = require( '../testconfig' ),

  mysql = require( 'mysql' ),

  _ = require( 'lodash' );

describe( 'unsubscribed - functional: .is', function() {

  beforeEach( done => {

    service.initAndLoad( config, done );

  } );

  it( 'simple .is', done => {

    let userUid = 12345678,

      values = {
        type: 'some.type',
        subject: 'agenda',
        identifier: 2
      };

    service( userUid ).is( values, ( err, is ) => {

      expect(is).toBe(false);

      service( userUid ).add( values, ( err, result ) => {

        service( userUid ).is( values, ( err, is ) => {

          expect(is).toBe(true);

          done();

        } );        

      } );

    } );

  } );


  it( 'simple .is without identifier', done => {

    let userUid = 12345678,

      values = {
        type: 'notifications_summary',
        subject: 'notifications'
      };

    service( userUid ).is( values, ( err, is ) => {

      expect(is).toBe(false);

      service( userUid ).add( values, err => {

        service( userUid ).is( values, ( err, is ) => {

          expect(is).toBe(true);

          done();

        } );

      } );

    } );

  } );


  it( 'simple .is without type', done => {

    let userUid = 12345678,

      values = {
        type: 'some.type',
        subject: 'agenda',
        identifier: 2
      };

    service( userUid ).is( values, ( err, is ) => {

      expect(is).toBe( false );

      service( userUid ).add( values, ( err, result ) => {

        service( userUid ).is( {
          subject: 'agenda',
          identifier: 2
        }, ( err, is ) => {

          expect(is).toBe(true);

          done();

        } );        

      } );

    } );

  } );

} );