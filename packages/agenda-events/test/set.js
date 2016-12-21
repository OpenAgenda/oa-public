"use strict";

process.env.NODE_ENV = 'test';

const svc = require( '../' );

const config = require( '../testconfig' );

const should = require( 'should' );

const fixtures = require( './fixtures' );

const mysql = require( 'mysql' );

const _ = require( 'lodash' );

describe( 'set agenda_event references', () => {

  beforeEach( () => {

    svc.init( config );

  } );

  beforeEach( done => {

    fixtures( config, [ 'agenda_event_empty' ], done );

  } );

  describe( 'basic create', () => {

    it( 'simplest create is done by only specify agenda & event ids', done => {

      svc( 1 ).set( 2, ( err, result ) => {

        result.should.eql( {
          success: true,
          valid: true,
          errors: [],
          agendaEvent: {
            eventId: 2,
            agendaId: 1,
            featured: false,
            state: svc.states.TOCONTROL,
            updatedAt: result.agendaEvent.updatedAt,
            createdAt: result.agendaEvent.createdAt,
            id: 1
          },
          created: true
        } );

        done();

      } );

    } );

    it( 'inserts a new record in db', done => {

      let con = mysql.createConnection( config.mysql );

      con.query( 'select * from agenda_event', ( err, rows ) => {

        rows.length.should.equal( 0 );

        svc( 1 ).set( 2, ( err, result ) => {

          con.query( 'select * from agenda_event', ( err, rows ) => {

            rows.length.should.equal( 1 );

            con.end();

            done();

          } );

        } );

      } );

    } );


    it( 'interface method onCreate is called when defined', done => {

      svc.init( _.assign( {}, config, {
        interfaces: {
          onCreate: function( created ) {

            _.omit( created, [ 'updatedAt', 'createdAt' ] )

              .should.eql( {
                eventId: 2,
                agendaId: 1,
                featured: false,
                id: 1,
                state: 0
              } );

            done();

          }
        }
      } ) );

      svc( 1 ).set( 2, err => {} );

    } );

  } );

  describe( 'basic update', () => {

    it( 'update gives detailed operation result', done => {

      svc( 1 ).set( 2, err => {

        svc( 1 ).set( 2, { featured: true }, ( err, result ) => {

          result.should.eql( {
            success: true,
            valid: true,
            errors: [],
            agendaEvent: { 
              id: 1,
              agendaId: 1,
              eventId: 2,
              state: 0,
              featured: true,
              createdAt: result.agendaEvent.createdAt,
              updatedAt: result.agendaEvent.updatedAt
            },
            updated: true,
            previous: {
              id: 1,
              agendaId: 1,
              eventId: 2,
              state: 0,
              featured: 0,
              createdAt: result.previous.createdAt,
              updatedAt: result.previous.updatedAt
            } 
          } );

          done();

        } );

      } );

    } );

    it( 'udpate does not insert new entries in db', done => {

      svc( 1 ).set( 2, err => {

        svc( 1 ).set( 2, { featured: true }, ( err, result ) => {

          let con = mysql.createConnection( config.mysql );

          con.query( 'select * from agenda_event', ( err, rows ) => {

            rows.length.should.equal( 1 );

            con.end();

            done();

          } );

        } );

      } );

    } );


    it( 'interface method onUpdate is called when defined', done => {

      svc.init( _.assign( {}, config, {
        interfaces: {
          onUpdate: function( before, after ) {

            _.omit( before, [ 'updatedAt', 'createdAt' ] ).should.eql( {
              id: 1,
              agendaId: 1,
              eventId: 2,
              state: 0,
              featured: 0
            } );

            _.omit( after, [ 'updatedAt', 'createdAt' ] ).should.eql( {
              id: 1,
              agendaId: 1,
              eventId: 2,
              state: 0,
              featured: true
            } )

            done();

          }
        }
      } ) );

      svc( 1 ).set( 2, err => {

        svc( 1 ).set( 2, { featured: true }, err => {} );

      } );

    } );

  } );


} );