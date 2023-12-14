"use strict";

const service = require( './service' ),

  config = require( '../testconfig' ),

  mysql = require( 'mysql' ),

  _ = require( 'lodash' );

describe( 'unsubscribed - functional: .add', function() {

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

        expect(
          _.pick( rows[ 0 ], [ 'type', 'subject', 'identifier', 'user_uid' ] )
        ).toEqual( {
          type: 'some.type',
          subject: 'agenda',
          identifier: '2',
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

        expect(
          _.pick( rows[ 0 ], [ 'type', 'subject', 'identifier', 'user_uid' ] )
        ).toEqual( {
          type: null,
          subject: 'agenda',
          identifier: '12',
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

        expect(
          _.pick( rows[ 0 ], [ 'type', 'subject', 'identifier', 'user_uid' ] )
        ).toEqual( {
          subject: 'notifications',
          type: 'summary',
          identifier: null,
          user_uid: 1237021
        } );

        done();

      } );

    } );

  } );


  it( 'simple add with email', done => {

    service( 0 ).add( {
      type: 'eventEmail',
      subject: 'email',
      identifier: 'bertho@cibul.net'
    }, ( err, result ) => {

      const con = mysql.createConnection( config.mysql );

      con.query( 'select * from unsubscribed where subject = ? and type = ?', [ 'email', 'eventEmail' ], ( err, rows ) => {

        con.end();

        expect(
          _.pick( rows[ 0 ], [ 'type', 'subject', 'identifier', 'user_uid' ] )
        ).toEqual( {
            type: 'eventEmail',
            subject: 'email',
            identifier: 'bertho@cibul.net',
            user_uid: 0
          } );

        done();

      } );

    } );

  } );

} );
