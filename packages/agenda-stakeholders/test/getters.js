"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );

const config = require( '../testconfig' );

const mysql = require( 'mysql' );

  // test proxy for service.
const service = require( './service' );

describe( 'agenda-stakeholders', () => {

  describe( 'getters', function () {

    this.timeout( 60000 );

    before( done => {

      service.initAndLoad( config, done );

    } );

    it( 'get with id gets stakeholder matching id', done => {

      service( 4608 ).get( {
        id: 6975
      }, ( err, stakeholder ) => {

        should( err ).equal( null );

        stakeholder.id.should.equal( 6975 );

        done();

      } );

    } );


    it( 'detailed get uses interface to get event count', done => {

      service( 4608 ).get( {
        id: 6975
      }, { detailed: true }, ( err, stakeholder ) => {

        stakeholder.user.should.eql( { 
          id: 2576,
          uid: 128492293,
          user_name: 'Zorg',
          email: 'zorg@galactic.uv' 
        } );

        stakeholder.eventCount.should.equal( 35 );

        done();

      } );

    } );


    it( 'get with userId gets stakeholder matching userId', done => {

      service( 4608 ).get( {
        userId: 7368
      }, ( err, stakeholder ) => {

        should( err ).equal( null );

        stakeholder.should.eql( {
          id: 6996,
          userId: 7368,
          agendaId: 4608,
          credential: 3,
          updatedAt: new Date( 'Thu Feb 04 2016 21:20:21 GMT+0100 (CET)' ),
          createdAt: new Date( 'Fri Jan 01 2016 01:10:01 GMT+0100 (CET)' ),
          custom: {
            organization: {
              label: 'DRAC PACA',
              slug: 'drac-paca'
            },
            contactNumber: '04 42 16 19 75',
            contactName: 'LARROUMEC',
            contactPosition: 'CORRESPONDANT'
          }
        } );

        done();

      } );

    } );


    it( 'list gives the tenth stakeholder only', done => {

      service( 4608 ).list( 9, 1, ( err, stakeholders ) => {

        should( err ).equal( null );

        stakeholders.length.should.equal( 1 );

        stakeholders[ 0 ].should.eql( {
          id: 6996,
          credential: 3,
          userId: 7368,
          agendaId: 4608,
          updatedAt: new Date( 'Thu Feb 04 2016 21:20:21 GMT+0100 (CET)' ),
          createdAt: new Date( 'Fri Jan 01 2016 01:10:01 GMT+0100 (CET)' ),
          custom: {
            organization: {
              label: 'DRAC PACA',
              slug: 'drac-paca'
            },
            contactNumber: '04 42 16 19 75',
            contactName: 'LARROUMEC',
            contactPosition: 'CORRESPONDANT'
          }
        } );

        done();

      } );

    } );

    it( 'lists first 20 stakeholders of an agenda', done => {

      service( 4608 ).list( 0, 20, ( err, stakeholders ) => {

        stakeholders.length.should.equal( 20 );

        should( err ).equal( null );

        done();

      } );

    } );

    it( 'lists first 20 stakeholders of a user', done => {

      service.user( 7368 ).list( 0, 1, ( err, stakeholders ) => {

        stakeholders.length.should.equal( 1 );

        stakeholders[ 0 ].should.eql( {
          id: 6996,
          credential: 3,
          userId: 7368,
          agendaId: 4608,
          updatedAt: new Date( 'Thu Feb 04 2016 21:20:21 GMT+0100 (CET)' ),
          createdAt: new Date( 'Fri Jan 01 2016 01:10:01 GMT+0100 (CET)' ),
          custom: {
            organization: {
              label: 'DRAC PACA',
              slug: 'drac-paca'
            },
            contactNumber: '04 42 16 19 75',
            contactName: 'LARROUMEC',
            contactPosition: 'CORRESPONDANT'
          }
        } );

        done();

      } );

    } );


    it( 'detailed list uses interface to get event count', done => {

      service.user( 7368 ).list( { detailed: true }, 0, 1, ( err, stakeholders ) => {

        stakeholders[ 0 ].user.should.eql( { 
          id: 7368,
          uid: 128492293,
          user_name: 'Zorg',
          email: 'zorg@galactic.uv' 
        } );

        stakeholders[ 0 ].eventCount.should.equal( 35 );

        done();

      } );

    } );

  } );

} );