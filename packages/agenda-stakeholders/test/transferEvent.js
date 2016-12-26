"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

config = require( '../testconfig' ),

mysql = require( 'mysql' ),

service = require( './service' );

describe( 'agenda-stakeholders', function () {

  describe( 'transferEvent', function () {

    this.timeout( 60000 );

    before( done => {

      service.init( config, done );

    } );

    describe( 'transferEvent', () => {

      it( 'does not find a stakeholder', done => {

        service( 4608 ).transferEvent( {
          event: { id: 82374 },
          user: { id: 9999 }
        }, err => {

          err.should.equal( 'stakeholder was not found' );

          done();

        } );

      } );

      it( 'does not find the event', done => {

        service( 4608 ).transferEvent( {
          event: { id: 9999 },
          user: { id: 7368 }
        }, err => {

          err.should.equal( 'event was not found' );

          done();

        } );

      } );


      it( 'transfers the event contribution', done => {

        service( 4608 ).transferEvent( {
          event: { id: 82374 },
          user: { id: 7368 }
        }, err => {

          let con = mysql.createConnection( config.mysql );

          con.query( 'select user_id from agenda_event where event_id = ?', 82374, ( err, rows ) => {

            rows[ 0 ].user_id.should.equal( 7368 );

            con.end();

            done();

          } );

        } );

      } );


      it( 'transfers the event ownership', done => {

        service( 4608 ).transferEvent( {
          event: { id: 82378 },
          user: { id: 7368 }
        }, err => {

          let con = mysql.createConnection( config.mysql );

          con.query( 'select owner_id from event where id = ?', 82378, ( err, rows ) => {

            rows[ 0 ].owner_id.should.equal( 7368 );

            con.end();

            done();

          } );

        } );

      } );

    } );

  } );

} );