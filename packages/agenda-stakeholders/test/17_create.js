"use strict";

process.env.NODE_ENV = 'test';

const service = require( './service' );
const should = require( 'should' );
const config = require( '../testconfig' );
const _ = require( 'lodash' );

describe( 'agenda-stakeholders - functional (server): create', function() {

  this.timeout( 60000 );

  before( done => {

    service.initAndLoad( config, done );

  } );

  describe( 'basic usage', () => {

    it( 'by default, all required schema fields are necessary for stakeholder creation', done => {

      service.agenda( 4608 ).create( {
        email: 'jacky@ponceau.fr',
        contactName: 'Jacky',
        organization: 'Chez Papy',
        contactNumber: 17,
        contactPosition: 'Cuisto'
      }, ( err, result ) => {

        result.success.should.equal( true );

        result.stakeholder.custom.should.eql( {
          email: 'jacky@ponceau.fr',
          contactName: 'Jacky',
          organization: {
            label: 'Chez Papy',
            slug: 'chez-papy'
          },
          contactNumber: 17,
          contactPosition: 'Cuisto'
        } );

        done();

      } );

    } );

    it( 'create does not occur if schema fields are not provided', done => {

      service.agenda( 4608 ).create( {
        email: 'papy@ponceau.fr'
      }, ( err, result ) => {

        result.success.should.equal( false );

        result.errors.length.should.equal( 4 );

        result.errors[ 0 ].should.eql( {
          field: 'organization',
          code: 'required',
          message: 'a string is required',
          origin: undefined
        } );

        done();

      } );

    } );

    it( '... unless allowPartial option is set', done => {

      service.agenda( 4608 ).create( {
        email: 'papy@ponceau.fr'
      }, { allowPartial: true }, ( err, result ) => {

        result.success.should.equal( true );

        done();

      } );

    } );

    it( 'created stakeholder has contributor credential by default', done => {

      service.agenda( 4608 ).create( {
        email: 'sonny@ponceau.fr'
      }, { allowPartial: true }, ( err, result ) => {

        result.success.should.equal( true );

        result.stakeholder.credential.should.equal( service.types.get( 'contributor' ) );

        done();

      } );

    } );

    it( 'created stakeholder is associated with user when user is found through service interface .getUser', done => {

      service.agenda( 4608 ).create( {
        email: 'janine@ponceau.fr'
      }, { allowPartial: true }, ( err, result ) => {

        result.stakeholder.userId.should.equal( 123 );

        done();

      } );

    } );

    it( 'created stakeholder takes given name when existing', done => {

      service.agenda( 4608 ).create( {
        email: 'temps@ponceau.fr',
        contactName: 'Des Portes'
      }, { allowPartial: true }, ( err, result ) => {

        result.stakeholder.custom.contactName.should.equal( 'Des Portes' );

        done();

      } );

    } );

    it( 'created stakeholder takes name given by interface when not specified in input data', done => {

      service.agenda( 4608 ).create( {
        email: 'macareu@bonnet.pc'
      }, { allowPartial: true }, ( err, result ) => {

        result.stakeholder.custom.contactName.should.equal( 'Zorg' );

        done();

      } );

    } );

    it( 'credential ( role ) can be specified via create options', done => {

      service.agenda( 4608 ).create( {
        email: 'allezvienschirie@ponceau.fr'
      }, { 
        allowPartial: true,
        credential: service.types.get( 'administrator' ) 
      }, ( err, result ) => {

        result.stakeholder.credential.should.equal( service.types.get( 'administrator' ) );

        done();

      } );

    } );

    it( 'onCreate interface is called when create is successful', done => {

      service.init( _.extend( {}, config, {
        interfaces: _.extend( {}, config.interfaces, {
          onCreate: stakeholder => {

            stakeholder.custom.email.should.equal( 'innocent@khn.com' );

            service.init( config, () => { done(); } );

          }
        } )
      } ), () => {

        service.agenda( 4608 ).create( {
          email: 'innocent@khn.com'
        }, { allowPartial: true }, () => {

        } );

      } );

    } );

  } );

  describe( 'unlinked stakeholder', () => {

    beforeEach( done => {

      // interface gives user to service
      // for these tests, we assume none of the emails
      // used for creation have associated user accounts:
      service.init( _.extend( {}, config, {
        interfaces: {
          getUser: ( identifiers, cb ) => { cb() }
        }
      } ), done.bind( null ) );

    } );

    afterEach( done => {

      service.init( config, done.bind( null ) );

    } );

    it( 'create empty stakeholder gives stakeholder with null userId', done => {

      service.agenda( 4608 ).create( {
        email: 'gaetan@cibul.net'
      }, {
        allowPartial: true
      }, ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( true );

        should( result.stakeholder.userId ).equal( null );

        done();

      } );

    } );

  } );

  describe( 'create errors and edge cases', () => {

    it( 'if email is already matching a stakeholder, create is not completed', done => {

      service.agenda( 4608 ).create( {
        email: 'invitedguy@email.com' // this guy already exists in fixtures
      }, {
        allowPartial: true
      }, ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( false );

        result.errors.should.eql( [ {
          origin: 'invitedguy@email.com',
          code: 'email.already_created',
          field: 'email'
        } ] );

        done();

      } )

    } );  

    it( 'email must be specified in all cases', done => {

      service.agenda( 4608 ).create( {
        contact_name: 'Batman'
      }, { 
        allowPartial: true
      }, ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( false );

        result.valid.should.equal( false );

        result.errors.should.eql( [ {
          origin: undefined,
          code: 'email.missing',
          field: 'email'
        } ] );

        done();

      } );

    } );

  } );


  describe( 'context', () => {

    afterEach( done => {

      service.init( config, done.bind( null ) );

    } );

    it( 'context data can be passed through options to interfaces', done => {

      service.init( _.extend( {}, config, {
        interfaces: _.extend( {}, config.interfaces, {
          onCreate: ( stakeholder, context ) => {

            context.should.eql( {
              message: 'Lolipops',
              replyTo: null,
              lang: 'fr',
              invitationSender: {
                name: null,
                userId: null
              }
            } );

            done();

          }
        } )
      } ) );

      service.agenda( 4608 ).create( {
        email: 'kraken@oa.com'
      }, {
        allowPartial: true,
        context: {
          message: 'Lolipops',
          replyTo: null,
          lang: 'fr'
        }
      }, ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( true );

      } );

    } );

  } );

} );
