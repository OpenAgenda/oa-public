"use strict";

const should = require( 'should' );

const Stakeholder = require( '../src/iso/Stakeholder.js' );

const extend = require( 'lodash/extend' );

const validFieldValues = {
  contactName: 'Jeff',
  contactNumber: '01',
  contactPosition: 'Over there',
  organization: 'Jeff corp',
  email: 'jeff@email.com'
};

const server = require( './lib/server' );

describe( 'agenda stakeholders - functional (iso): Stakeholder', () => {

  beforeEach( () => {

    // the local test server provides get & post access
    // to 'data' through the given port
    server.resetTestConfig( {
      delay: 0,
      data: { fieldValues: validFieldValues }
    } );

    server.listen( 3000 );

  } );

  afterEach( done => {

    server.close( () => done() );

  } );

  describe( 'instanciation', () => {

    it( 'Empty initialization creates a usable instance for data validation', () => {

      let s = new Stakeholder();

      s.set( validFieldValues );

      s.isValid().should.equal( true );

    } );

    it( 'Data can also be passed as first argument', () => {

      let s = new Stakeholder( validFieldValues );

      s.isValid().should.equal( true );

    } );

    it( 'To enable saving & syncing with server data, a "res" has to be specified', done => {

      let s = new Stakeholder( validFieldValues );

      s.isSynced( err => {

        err.should.equal( 'No link is established with server' );

        done();

      } );

    } );

    it( 'res can be specified at initialization', done => {

      let s = new Stakeholder( { fieldValues: validFieldValues }, { res: 'http://localhost:3000' } );

      s.isSynced( ( err, synced ) => {

        synced.should.equal( true );

        done();

      } );

    } );

  } );


  describe( '.isSynced', () => {

    it( 'res can be specified and re-specified later on', done => {

      let s = new Stakeholder( { fieldValues: validFieldValues } );

      s.setRes( 'http://localhost:3000' );

      s.isSynced( ( err, synced ) => {

        synced.should.equal( true );

        done();

      } );

    } );

    it( 'onBusyChange hook can be used to monitor instance link busy state', done => {

      let expectedSequence = [ true, false ], iteration = 0;

      let s = new Stakeholder( validFieldValues, {
        res: 'http://localhost:3000',
        onBusyChange: busy => {

          busy.should.equal( expectedSequence[ iteration++ ] );

        }
      } );

      // one call for sync verification
      // will trigger a round-trip to server ( meaning link will be busy )
      // as no data is cached yet
      s.isSynced( () => {

        // second call for sync verif
        // will NOT trigger a round-trip to server.
        s.isSynced( () => {} );

      } );


      setTimeout( () => {

        iteration.should.equal( 2 );

        done();

      }, ( server.getTestConfig().delay + 100 ) * 2 );


    } );

    it( 'Changing values after sync means instance will be unsynced again', done => {

      let s = new Stakeholder( validFieldValues, {
        res: 'http://localhost:3000',
      } );

      s.isSynced( ( err, synced ) => {

        synced.should.equal( true );

        s.set( extend( {}, validFieldValues, {
          email: 'other@email.com'
        } ) );

        s.isSynced( ( err, synced ) => {

          synced.should.equal( false );

        } );

        done();

      } );

    } );

  } );


  describe( '.isValid', () => {

    it( 'isValid returns true when stakeholder data is valid', () => {

      let s = new Stakeholder( {
        organization: 'Mail Inc',
        email: 'the@email.com',
        contactNumber: '01 02 03',
        contactName: 'Theem Ail',
        contactPosition: 'To the right'
      } );

      s.isValid().should.equal( true );

    } );

    it( 'and the opposite', () => {

      let s = new Stakeholder( {
        contactName: 'Shoo'
      } );

      s.isValid().should.equal( false );

    } );

  } );


  describe( '.getErrors', () => {

    it( 'getErrors returns the list of data validation errors', () => {

      let s = new Stakeholder( {
        organization: 'Mail Inc',
        email: 'the@email.com',
        contactNumber: 'Beeeepbeeepbeeep',
        contactName: 'Theem Ail',
        contactPosition: 'To the right'
      } );

      s.getErrors().should.eql( [ {
        origin: 'Beeeepbeeepbeeep',
        field: 'contactNumber',
        code: 'phone.invalid',
        message: 'value is not a phone number'
      } ] );

    } );

    it( 'just returns an empty array if there are no errors', () => {

      let s = new Stakeholder( { fieldValues: validFieldValues } );

      s.getErrors().should.eql( [] );

    } );

    it( 'evaluates given non-empty value only when partial bool argument is true', () => {

      let s = new Stakeholder( {
        email: 'the@email.com',
        contactName: ''
      } );

      s.getErrors( true ).should.eql( [] );

    } );

  } );


  describe( '.get', () => {

    it( 'get returns the current data', () => {

      let s = new Stakeholder( {
        contactName: 'Bidoo'
      } );

      s.get().should.eql( {
        contactName: 'Bidoo'
      } );

    } );

  } );


  describe( '.set', () => {

    it( 'set sets the current field data, even when not valid', () => {

      let s = new Stakeholder( {
        contactName: 'Bah'
      } );

      s.set( {
        email: 'not an email'
      } );

      s.get().should.eql( {
        email: 'not an email'
      } );

    } );

    it( 'set returns the array of validation errors', () => {

      let s = new Stakeholder( {
        contactName: 'Jeff'
      } );

      s.set( {
        fieldValues: extend( {}, validFieldValues, { email: 'Jeffsatemail.com' } )
      } )

      .should.eql( [ {
        field: 'email',
        code: 'email.invalid',
        message: 'email is not valid',
        origin: 'Jeffsatemail.com'
      } ] );

    } );

  } );


  describe( '.commit', () => {

    let broker = {
      credential: 1,
      fieldValues: {
        contactName: 'Joel Backman',
        contactPosition: 'Lawyer',
        organization: 'Backman',
        email: 'joel@backman.com',
        contactNumber: '+18002223344'
      }
    };

    it( 'commit pushes the field data to the server', done => {

      let s = new Stakeholder( broker, { res: 'http://localhost:3000' } );

      s.commit( ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( true );

        server.getTestConfig().data.should.eql( broker );

        done();

      } );

    } );

    it( 'data is synced after a commit', done => {

      let s = new Stakeholder( broker, { res: 'http://localhost:3000' } );

      s.isSynced( ( err, synced ) => {

        synced.should.equal( false );

        s.commit( err => {

          s.isSynced( ( err, synced ) => {

            synced.should.equal( true );

            done();

          } );

        } );

      } );

    } );

    it( 'commit with partial data', done => {

      let s = new Stakeholder( {
        credential: 1,
        fieldValues: {
          contactName: 'Moris Jhonson'
        }
      }, { res: 'http://localhost:3000' } );

      s.isSynced( ( err, synced ) => {

        synced.should.equal( false );

        s.commit( true, err => {

          s.isSynced( ( err, synced ) => {

            synced.should.equal( true );

            done();

          } );

        } );

      } );

    } );

  } );


  describe( 'with credential', () => {

    beforeEach( () => {

      server.resetTestConfig( {
        delay: 0,
        data: { 
          fieldValues: validFieldValues,
          credential: 1
        }
      } );

    } );

    it( 'instanciate', done => {

      let s = new Stakeholder( {
        fieldValues: validFieldValues,
        credential: 1
      }, { res: 'http://localhost:3000' } );

      s.isSynced( ( err, synced ) => {

        synced.should.equal( true );

        done();

      } );

    } );

    it( 'get', () => {

      let s = new Stakeholder( {
        fieldValues: validFieldValues,
        credential: 1
      } );

      s.get().should.eql( {
        fieldValues: validFieldValues,
        credential: 1
      } );

    } );

    it( 'set', () => {

      let s = new Stakeholder( {
        fieldValues: validFieldValues,
        credential: 1
      } ),

        update = extend( {}, validFieldValues, { email: 'new@email.com' } );

      s.set( {
        fieldValues: update,
        credential: 2
      } ).should.eql( [] );

      s.get().should.eql( {
        fieldValues: update,
        credential: 2
      } );

    } );

    it( 'commit', done => {

      let s = new Stakeholder( {
        fieldValues: validFieldValues,
        credential: 1
      }, { res: 'http://localhost:3000' } ),

        update = extend( {}, validFieldValues, { email: 'new@email.com' } );

      s.set( {
        fieldValues: update,
        credential: 2
      } );

      s.commit( ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( true );

        server.getTestConfig().data.should.eql( {
          fieldValues: update,
          credential: 2
        } );

        done();

      } );

    } );

  } );

} );
