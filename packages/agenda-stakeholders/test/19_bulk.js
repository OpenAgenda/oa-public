"use strict";

process.env.NODE_ENV = 'test';

const service = require( './service' );
const should = require( 'should' );
const config = require( '../testconfig' );
const _ = require( 'lodash' );
const types = require( '../src/iso/credentialTypes' );
const queue = require( '@openagenda/queue' );

describe( 'agenda-stakeholders - functional (server): create.bulk & task', function() {

  this.timeout( 60000 );

  const queueTestConfig = {
    names: {
      bulk: 'stakeholderCreateTest'
    },
    threshold: 3,
    redis: {
      host: 'localhost',
      port: 6379
    }
  },

  q = queue( queueTestConfig.names.bulk, { redis: queueTestConfig.redis } );

  before( done => {

    service.initAndLoad( _.extend( {}, config, {
      queue: queueTestConfig,
      interfaces: _.extend( {}, config.interfaces, {
        getUser: ( identifiers, cb ) => {

           cb( null, {
            id: Math.ceil( Math.random() * 1000000 ),
            uid: 128492293,
            fullName: 'Zorg',
            email: identifiers.email || 'zorg@galactic.uv'
          } );

        }
      } )
    } ), done );

  } );

  beforeEach( done => {

    q.test.clear( queueTestConfig.names.bulk, err => {

      done();

    } );

  } );

  describe( 'below threshold ( direct execution )', () => {

    it( 'bulk create takes a list of stakeholder data and callsback with listed create response', done => {

      service.agenda( 4608 ).bulk( [ {
        email: 'jacky@ponceau.fr',
        contact_name: 'Jacky',
        organization: 'Chez Papy',
        contact_number: 17,
        contact_position: 'Cuisto'
      } ], ( err, result ) => {

        should( err ).equal( null );

        result.results.length.should.equal( 1 );

        // array of results is a list of [ err, result ] pairs from .create
        
        should( result.results[ 0 ][ 0 ] ).equal( null );

        result.results[ 0 ][ 1 ].stakeholder.custom.should.eql( {
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


    it( 'bulk create processes takes "allowPartial" option', done => {

      service.agenda( 4608 ).bulk( [ {
        email: 'papy@ponceau.fr'
      } ], { allowPartial: true }, ( err, result ) => {

        should( err ).equal( null );

        should( result.results[ 0 ][ 0 ] ).equal( null );

        result.results[ 0 ][ 1 ].stakeholder.custom.should.eql( {
          contactName: 'Zorg',
          email: 'papy@ponceau.fr'
        } );

        done();

      } );

    } );

    it( 'bulk updates pre-existing stakeholders', done => {

      service.agenda( 4608 ).bulk( [ {
        email: 'goa@tee.com'
      }, {
        email: 'newgoa@tee.com'
      } ], { 
        allowPartial: true, 
        credential: types.get( 'moderator' )
      }, ( err, result ) => {

        let r = result.results[ 0 ][ 1 ],

          r1 = result.results[ 1 ][ 1 ];

        r.success.should.equal( true );

        r.operation.should.equal( 'update' );

        r.stakeholder.custom.email.should.equal( 'goa@tee.com' );

        r1.operation.should.equal( 'create' );

        r1.success.should.equal( true );

        done();

      } );

    } );

    it( 'bulk does not allow downgrading stakeholders', done => {

      service.agenda( 4608 ).bulk( [ {
        email: 'downgradedgoa@tee.com'
      } ], { 
        allowPartial: true, 
        credential: types.get( 'moderator' )
      }, ( err, result ) => {

        let r = result.results[ 0 ][ 1 ];

        r.success.should.equal( false );

        should( r.operation ).equal( null );

        r.errors.should.eql( [ { 
          field: 'credential', 
          code: 'credential.downgrade', 
          origin: 3 
        } ] );

        done();

      } );

    } );



    it( 'bulk create processes input if is below config threshold', done => {

      service.agenda( 4608 ).bulk( [ {
        email: 'keeeviiiinnnalllléééééé@oa.com'
      }, {
        email: 'cooooode@oa.com'
      } ], { allowPartial: true }, ( err, result ) => {

        should( err ).equal( null );

        result.queued.should.equal( false );

        result.results.length.should.equal( 2 );

        done();

      } );

    } );

  } );


  describe( 'above threshold ( queued )', () => {

    it( 'bulk create over threshold queues creates', done => {

      service.agenda( 4608 ).bulk( [ {
        email: 'grincheux@bn.disney'
      }, {
        email: 'jovial@bn.disney'
      }, {
        email: 'shooté@bn.disney'
      }, {
        email: 'distrait@bn.disney'
      } ], { allowPartial: true }, ( err, result ) => {

        should( err ).equal( null );

        result.queued.should.equal( true );

        done();

      } );

    } );

    it( 'queued creates are processed by .task', done => {

      service.agenda( 4608 ).bulk( [ {
        email: 'one@nb.com'
      }, {
        email: 'two@nb.com'
      }, {
        email: 'three@nb.com'
      }, {
        email: 'four@nb.com'
      } ], { allowPartial: true }, ( err, result ) => {

        /// result.queued is true

      } );

      // in parallel, somewhere, this happens ( task callback is completly optional )
      
      let processedCount = 0;

      // task callback is not for production.
      // just here to demonstrate that create happens throught task.
      // use interfaces ( onCreate ) to follow creates
      service.tasks.bulk( ( err, result ) => {

        let shouldEmail = [ 'one@nb.com', 'two@nb.com', 'three@nb.com', 'four@nb.com' ][ processedCount++ ]

        result.stakeholder.custom.email.should.equal( shouldEmail );

        if ( processedCount === 3 ) done();

      } );

    } )

  } );


  describe( 'particulars', () => {

    it( 'if email given in bulk matches a user account ( through interfaces ) but not a stakeholder email, operation should be an update', done => {

      // getUser interface will find Ted
      service.init( _.extend( {}, config, {
        interfaces: _.extend( {}, config.interfaces, {
          getUser: ( identifiers, cb ) => {

            if ( identifiers && identifiers.email === 'ted@oa.com' ) {

              return cb( null, {
                // this id is a stakeholder in fixtures
                id: 7886,
                uid: 193982982,
                user_name: 'Ted',
                email: 'ted@oa.com'
              } )

            }

            cb( null );

          }
        } )
      } ) );


      service.agenda( 4608 ).bulk( [ {
        email: 'ted@oa.com'
      } ], {
        allowPartial: true,
        credential: types.get( 'administrator' )
      }, ( err, result ) => {

        result.results[ 0 ][ 1 ].operation.should.equal( 'update' );

        done();

      } );

    } );

  } );

} );