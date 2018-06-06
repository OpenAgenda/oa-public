"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

  config = require( '../testconfig' ),

  creds = require( '../src/iso/credentialTypes' ),

  _ = require( 'lodash' );


const service = require( './service' );

describe( 'agenda-stakeholders - functional (server): list', function() {

  describe( 'general', function() {

    this.timeout( 60000 );

    before( done => {

      service.initAndLoad( config, done );

    } );

    it( 'a simple list call will get you a slice of stakeholders matching limit&offset difference', done => {

      // same as service( 4608 ).list
      service.agenda( 4608 ).list( 0, 10, ( err, stakeholders, total ) => {

        stakeholders.length.should.equal( 10 );

        done();

      } );

    } );

    it( 'by default, list is sorted by decreasing actions counter', done => {

      service.agenda( 4608 ).list( 0, 4, ( err, stakeholders, total ) => {

        stakeholders.map( s => s.actionsCounter ).should.eql( [ 200, 12, 4, 3 ] );

        done();

      } );

    } );


    it( 'list can be sorted by descending roles (credential)', done => {

      service.agenda( 4608 ).list( { order: 'credential' }, 0, 100, ( err, stakeholders, total ) => {

        let i = 0;

        let credValues = creds.types.map( c => c.value ).reverse();

        stakeholders.forEach( s => {

          if ( s.credential !== credValues[ i ] ) {

            s.credential.should.equal( credValues[ ++i ] );

          }

        } );

        done();

      } );

    } );


    it( 'list can be filtered to show only specific users by there id', done => {

      service.agenda( 4608 ).list( { userId: [ 7445, 7447, 7450, 7448 ] }, 0, 100, ( err, stakeholders ) => {

        stakeholders.length.should.equal( 4 );

        stakeholders.forEach( s => {

          [ 7445, 7447, 7450, 7448 ].includes( s.userId ).should.equal( true );        

        } );

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

        should( err ).equal( null );

        stakeholders[ 0 ].user.should.eql( {
          id: 3078,
          uid: 128492293,
          fullName: 'Zorg',
          email: 'zorg@galactic.uv'
        } );

        done();

      } );

    } );

    it( 'detailed option to true means contribution count is retrieved', done => {

      service.agenda( 4608 ).list( 0, 1, { detailed: true }, ( err, stakeholders ) => {

        should( err ).equal( null );

        stakeholders[ 0 ].eventCount.should.equal( 35 );

        done();

      } );        

    } );

    it( 'search query searches in custom field data', done => {

      service.agenda( 4608 ).list( { search: 'Mairie' }, 0, 10, { total: true }, ( err, stakeholders, total ) => {

        stakeholders[ 0 ].custom.organization.should.equal( 'Mairie de Tarascon' );

        stakeholders.length.should.equal( 9 );

        total.should.equal( 9 );

        done();

      } );

    } );

    it( 'slug for slugged fields is given when showSlugs is true', done => {

      service.agenda( 4608 ).list( { search: 'Mairie' }, 0, 1, { showSlugs: true }, ( err, stakeholders ) => {

        stakeholders[ 0 ].custom.organization.should.eql( {
          slug: 'mairie-de-tarascon',
          label: 'Mairie de Tarascon'
        } );

        done();

      } );

    } );

    it( 'invited ( unnassociated ) stakeholders are filtered with .invited query parameter', done => {

      service.agenda( 4608 ).list( { invited: true }, 0, 10, { total: true }, ( err, stakeholders, total ) => {

        total.should.equal( 7 );

        stakeholders.forEach( s => {

          should( s.userId ).equal( null );

        } );

        done();

      } );

    } );

    it( 'invited ( unnassociated ) are filtered out with .invited query parameter set to false', done => {

      service.agenda( 4608 ).list( 0, 1, { total: true }, ( err, s, overallTotal ) => {

        service.agenda( 4608 ).list( { invited: false }, 0, 1, { total: true }, ( err, s, withUserTotal ) => {

          overallTotal.should.equal( withUserTotal + 7 );

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
        total.should.equal( 519 );

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

  describe( 'filtered by credential', function() {

    this.timeout( 60000 );

    beforeEach( done => {

      service.initAndLoad( config, done );

    } );

    
    it( 'list excludes unset cred types when these are not given by interface', done => {

      service.agenda( 4608 ).list( 0, 10, ( err, stakeholders ) => {

        // there are users which are not administrators
        stakeholders.map( s => s.credential ).filter( c => c !== 2 ).length.should.not.equal( 0 );

        service.init( _.extend( {}, config, {
          interfaces: _.extend( {}, config.interfaces, {
            getExistingCredentials: ( agendaId, cb ) => {

              cb( null, [ 2 ] );

            }
          } )
        } ), () => {

          service.agenda( 4608 ).list( 0, 10, ( err, stakeholders ) => {

            stakeholders.map( s => s.credential ).filter( c => c !== 2 ).length.should.equal( 0 );

            done();

          } );

        } );

      } );

    } );

  } );


  describe( 'filtered by deletedUser', function() {

    this.timeout( 60000 );

    beforeEach( done => {

      service.initAndLoad( config, done );

    } );

    it( 'list can be filtered to exclude or include deleted users', done => {

      service.agenda( 4608 ).list( 0, 1, { total: true }, ( e, st, total ) => {

        service.agenda( 4608 ).list( { deletedUser: true },  0, 1, { total: true }, ( e, st, deletedUserTotal ) => {

          service.agenda( 4608 ).list( { deletedUser: false },  0, 1, { total: true }, ( e, st, undeletedUserTotal ) => {

            deletedUserTotal.should.equal( 5 );

            total.should.equal( undeletedUserTotal + deletedUserTotal );

            done();

          } );

        } );

      } );

    } )

  } );


  describe( 'filtered by actionsCounter', function() {

    // pour la Bête de kevin
    this.timeout( 60000 );

    beforeEach( done => {

      service.initAndLoad( config, done );

    } );

    it( 'list can be filtered to show only users with actions counts', done => {

      service.agenda( 4608 ).list( { actionsCounterEqualZero: false }, 0, 10, ( err, stakeholders, total ) => {

        stakeholders.filter( s => !!s.actionsCounter ).length.should.equal( stakeholders.length );

        done();

      } );

    } );

    it( 'list can be filtered to show only users without actions counts', done => {

      service.agenda( 4608 ).list( { actionsCounterEqualZero: true }, 0, 100, ( err, stakeholders, total ) => {

        stakeholders.filter( s => !s.actionsCounter ).length.should.equal( stakeholders.length );

        done();

      } );

    } );

  } );

} );