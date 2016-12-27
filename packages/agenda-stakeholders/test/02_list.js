"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );
const config = require( '../testconfig' );
const mysql = require( 'mysql' );
const creds = require( '../iso/credentialTypes' );

const service = require( './service' );

describe( 'agenda-stakeholders - list', function() {

  this.timeout( 30000 );

  before( done => {

    service.initAndLoad( config, done );

  } );

  describe( 'agenda().list', () => {

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

    it( 'search query searches in custom field data', done => {

      service.agenda( 4608 ).list( { search: 'Mairie' }, 0, 10, { total: true }, ( err, stakeholders, total ) => {

        stakeholders[ 0 ].custom.organization.label.should.equal( 'Mairie de Chinon' );

        stakeholders.length.should.equal( 9 );

        total.should.equal( 9 );

        done();

      } );

    } );

    it( 'invited ( unnassociated ) stakeholders are filtered with .invited query parameter', done => {

      service.agenda( 4608 ).list( { invited: true }, 0, 10, { total: true }, ( err, stakeholders, total ) => {

        total.should.equal( 6 );

        stakeholders.forEach( s => {

          should( s.userId ).equal( null );

        } );

        done();

      } );

    } );

    it( 'invited ( unnassociated ) are filtered out with .invited query parameter set to false', done => {

      service.agenda( 4608 ).list( 0, 1, { total: true }, ( err, s, overallTotal ) => {

        service.agenda( 4608 ).list( { invited: false }, 0, 1, { total: true }, ( err, s, withUserTotal ) => {

          overallTotal.should.equal( withUserTotal + 6 );

          done();

        } );

      } );

    } );

    it( 'filter users by credential with the .credentials query parameter', done => {

      service.agenda( 4608 ).list( { 
        // credentials: [ 'moderator', 'contributor' ] also accepted
        credentials: [ 1, 2 ] 
      }, 0, 10, { total: true }, ( err, stakeholders, total ) => {

        stakeholders.forEach( s => {

          [ 1, 2 ].indexOf( s.credential ).should.not.equal( -1 );

        } );

        // total of contributors & moderators loaded by
        // fixtures for agenda 4608
        total.should.equal( 518 );

        done();

      } );

    } );

    it( 'combined filter', done => {

      service.agenda( 4608 ).list( {
        search: '@email.com',
        credentials: [ 1, 2 ],
        invited: true
      }, 0, 10, { total: true }, ( err, stakeholders, total ) => {

        total.should.equal( 4 );

        done();

      } );

    } );

  } );

} );