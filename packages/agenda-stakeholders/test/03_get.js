"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );
const config = require( '../testconfig' );
const mysql = require( 'mysql' );
const service = require( './service' );

describe( 'agenda-stakeholders - functional (server): get', function() {

  this.timeout( 60000 );

  before( done => {

    service.initAndLoad( config, done );

  } );

  describe( 'agenda.get', () => {

    it( 'get with id gets stakeholder matching id', done => {

      // same as service( 4608 ).list
      service.agenda( 4608 ).get( { id: 6975 }, ( err, stakeholder ) => {

        stakeholder.id.should.equal( 6975 );

        done();

      } );

    } );

    it( 'get with userId gets relevant stakeholder', done => {

      service.agenda( 4608 ).get( { userId: 7368 }, ( err, stakeholder ) => {

        stakeholder.id.should.equal( 6996 );

        done();

      } );

    } );

    it( 'get provides actions counter information', done => {

      service.agenda( 4608 ).get( { userId: 3083 }, ( err, stakeholder ) => {

        stakeholder.actionsCounter.should.equal( 3 );

        done();

      } );

    } );

    it( 'stakeholder provides deleted user flag value ( as a boolean )', done => {

      service.agenda( 4608 ).get( { id: 6975 }, ( err, stakeholder ) => {

        stakeholder.deletedUser.should.equal( false );

        done();

      } );

    } );

    it( 'get with detailed option set gives stakeholder contribution count', done => {

      service.agenda( 4608 ).get( { id: 6975 }, { detailed: true }, ( err, stakeholder ) => {

        stakeholder.eventCount.should.equal( 35 );

        done();

      } );

    } );

    it( 'get with detailed option set gives stakeholder user account info', done => {

      service.agenda( 4608 ).get( { id: 6975 }, { detailed: true }, ( err, stakeholder ) => {

        stakeholder.user.should.eql( { 
          id: 2576,
          uid: 128492293,
          fullName: 'Zorg',
          email: 'zorg@galactic.uv' 
        } );

        done();

      } );

    } );

    it( 'get based on email', done => {

      service.agenda( 4608 ).get( { email: 'invitedguy@email.com' }, ( err, stakeholder ) => {

        stakeholder.custom.email.should.equal( 'invitedguy@email.com' );

        done();

      } );

    } );

    it( 'leaving detailed unspecified means defaults to false and no additional data is fetched', done => {

      service.agenda( 4608 ).get( { id: 6975 }, ( err, stakeholder ) => {

        should( stakeholder.user ).equal( undefined );

        should( stakeholder.eventCount ).equal( undefined );

        done();

      } );

    } );

    it( 'get with wrong id returns null result', done => {

      service.agenda( 4608 ).get( { id: 666 }, { detailed: true }, ( err, stakeholder ) => {

        should( err ).equal( null );

        should( stakeholder ).equal( null );

        done();

      } );

    } );

  } );

  describe( 'user.get', () => {

    it( 'get from user endpoint needs an agendaId to be specified', done => {

      service.user( 7368 ).get( { agendaId: 4608 }, ( err, stakeholder ) => {

        stakeholder.id.should.equal( 6996 );

        done();

      } );

    } );

  } );

} );