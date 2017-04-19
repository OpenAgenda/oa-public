"use strict";

const should = require( 'should' ),

  service = require( './service' ),

  config = require( '../testconfig' ),

  mysql = require( 'mysql' ),

  _ = require( 'lodash' );

describe( 'unsubscribed - functional: .is', function() {

  this.timeout( 5000 );

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

      is.should.equal( false );

      service( userUid ).add( values, ( err, result ) => {

        service( userUid ).is( values, ( err, is ) => {

          is.should.equal( true );

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

      is.should.equal( false );

      service( userUid ).add( values, ( err, result ) => {

        service( userUid ).is( {
          subject: 'agenda',
          identifier: 2
        }, ( err, is ) => {

          is.should.equal( true );

          done();

        } );        

      } );

    } );

  } );

} );