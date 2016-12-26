"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );
const config = require( '../testconfig' );
const mysql = require( 'mysql' );

const service = require( './service' );

describe( 'agenda-stakeholders', function() {

  this.timeout( 30000 );

  before( done => {

    service.initAndLoad( config, done );

  } );

  describe( 'service.agenda.list', () => {

    it( 'a simple list call will get you a slice of stakeholders matching limit&offset difference', done => {

      // same as service( 4608 ).list
      service.agenda( 4608 ).list( 0, 10, ( err, stakeholders, total ) => {

        stakeholders.length.should.equal( 10 );

        done();

      } );

    } );

    it( 'by default, total value is not fetched', done => {

      service.agenda( 4608 ).list( 0, 10, ( err, stakeholders, total ) => {

        should( total ).equal( null );

        done();

      } );

    } );

    it( 'total option to true means total is fetched', done => {

      service.agenda( 4608 ).list( 0, 10, { total: true }, ( err, stakeholders, total ) => {

        total.should.equal( 564 );

        done();

      } );

    } );

    it( 'detailed option to true means user info is retrieved', done => {

      service.agenda( 4608 ).list( 0, 1, { detailed: true }, ( err, stakeholders ) => {

        stakeholders[ 0 ].user.should.eql( {
          id: 2,
          uid: 128492293,
          user_name: 'Zorg',
          email: 'zorg@galactic.uv' 
        } );

        done();

      } );

    } );

    it( 'detailed option to true means contribution count is retrieved', done => {

      service.agenda( 4608 ).list( 0, 1, { detailed: true }, ( err, stakeholders ) => {

        stakeholders[ 0 ].eventCount.should.equal( 35 );

        done();

      } );        

    } );

  } );

} );