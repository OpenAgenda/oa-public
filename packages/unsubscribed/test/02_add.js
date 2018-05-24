"use strict";

const should = require( 'should' ),

  service = require( './service' ),

  config = require( '../testconfig' ),

  mysql = require( 'mysql' ),

  _ = require( 'lodash' );

describe( 'unsubscribed - functional: .add', function() {

  this.timeout( 5000 );

  beforeEach( done => {

    service.initAndLoad( config, done );

  } );

  it( 'simple add', done => {

    service( 12345678 ).add( {
      type: 'some.type',
      subject: 'agenda',
      identifier: 2
    }, ( err, result ) => {

      const con = mysql.createConnection( config.mysql );

      con.query( 'select * from unsubscribed limit 5, 1', ( err, rows ) => {

        con.end();

        _.pick( rows[ 0 ], [ 'type', 'subject', 'identifier', 'user_uid' ] )

        .should.eql( {
          type: 'some.type',
          subject: 'agenda',
          identifier: 2,
          user_uid: 12345678
        } );

        done();

      } );

    } );

  } );


  it( 'simple add without type', done => {

    service( 12345678 ).add( {
      subject: 'agenda',
      identifier: 12
    }, ( err, result ) => {

      const con = mysql.createConnection( config.mysql );

      con.query( 'select * from unsubscribed limit 5, 1', ( err, rows ) => {

        con.end();

        _.pick( rows[ 0 ], [ 'type', 'subject', 'identifier', 'user_uid' ] )

        .should.eql( {
          type: null,
          subject: 'agenda',
          identifier: 12,
          user_uid: 12345678
        } );

        done();

      } );

    } );

  } );


  it( 'simple add without identifier', done => {

    service( 1237021 ).add( {
      subject: 'notifications',
      type: 'summary'
    }, ( err, result ) => {

      const con = mysql.createConnection( config.mysql );

      con.query( 'select * from unsubscribed where subject = ? and type = ?', [ 'notifications', 'summary' ], ( err, rows ) => {

        con.end();

        _.pick( rows[ 0 ], [ 'type', 'subject', 'identifier', 'user_uid' ] )

        .should.eql( {
          subject: 'notifications',
          type: 'summary',
          identifier: null,
          user_uid: 1237021
        } );

        done();

      } );

    } );

  } );

} );