"use strict";

const should = require( 'should' );
const _ = require( 'lodash' );
const server = require( './lib/server' );


const theData = {
  stuff: true,
  things: 'that too'
};

let serverData, serverDelay;


const Link = require( '../src/iso/Link' );

describe( 'agenda-stakeholders - unit (iso): Link', () => {

  beforeEach( () => {

    server.resetTestConfig( {
      delay: 0,
      data: _.extend( {}, theData )
    } );

    server.listen( 3000 );

  } );

  afterEach( done => {

    server.close( () => done() );

  } );


  describe( '.isSynced', () => {

    it( 'A link allows to verify data sync with remote. Give it some data to see if it maches server value', done => {

      let l = new Link( 'http://localhost:3000' );

      l.isSynced( { stuff: false }, ( err, synced ) => {

        // it does not match server data
        synced.should.equal( false );

        done();

      } );

    } );

    it( 'Matching data is marked as synced', done => {

      let l = new Link( 'http://localhost:3000' );

      l.isSynced( theData, ( err, synced ) => {

        synced.should.equal( true );

        done();

      } );

    } );

  } );

  describe( '.get', () => {

    it( 'get current value from server', done => {

      let l = new Link( 'http://localhost:3000' );

      l.get( ( err, data ) => {

        data.should.eql( server.getTestConfig().data );

        done();

      } );

    } );

  } );

  describe( '.commit', () => {

    it( 'used to commit data to server', done => {

      let l = new Link( 'http://localhost:3000' );

      let update = { fa: 'lala' };

      server.getTestConfig().data.should.not.eql( update );

      l.commit( update, err => {

        server.getTestConfig().data.should.eql( update );

        done();

      } );

    } );

  } );

  describe( 'hooks', () => {

    before( () => {

      server.resetTestConfig( {
        delay: 100
      } );

    } );

    it( 'onBusyChange notifies when the busy state of the link changes', done => {

      let l = new Link( 'http://localhost:3000' ),

      expectedBusyChanges = [ true, false ], iteration = 0;

      l.setHooks( {
        onBusyChange: busy => {

          busy.should.equal( expectedBusyChanges[ iteration++ ] );

          if ( iteration === 1 ) done();

        }
      } );

      l.get( () => {} );

    } );

  } );

} );