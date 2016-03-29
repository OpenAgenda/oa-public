"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

config = require( '../testconfig' ),

fixtures = require( './fixtures' ),

mysql = require( 'mysql' ),

service = require( '../service' );

describe( 'agenda-stakeholders', () => {

  describe( 'getters', function() {

    this.timeout( 10000 );

    before( done => {

      fixtures.init( config );

      fixtures( done );

      service.init( config );

    } );


    it( 'get with userId gets stakeholder matching userId', done => {

      service( 4608 ).get( {
        userId: 7368
      }, ( err, stakeholder ) => {

        should( err ).equal( null );

        stakeholder.should.eql( {
          credential: 3,
          organization: {
            label: 'DRAC PACA',
            slug: 'drac-paca'
          },
          userId: 7368,
          agendaId: 4608,
          contactNumber: '04 42 16 19 75',
          contactName: 'LARROUMEC',
          contactPosition: 'CORRESPONDANT'
        } );

        done();

      } );

    } );


    it( 'list gives the tenth stakholder only', done => {

      service( 4608 ).list( 9, 1, ( err, stakeholders ) => {

        stakeholders.length.should.equal( 1 );

        stakeholders[ 0 ].should.eql( { 
          id: 6996,
          credential: 3,
          userId: 7368,
          organization: {
            label: 'DRAC PACA', 
            slug: 'drac-paca' 
          },
          agendaId: 4608,
          contactNumber: '04 42 16 19 75',
          contactName: 'LARROUMEC',
          contactPosition: 'CORRESPONDANT' 
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

  } );

} );