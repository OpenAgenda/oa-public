"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( '@openagenda/fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.update', function () {

  this.timeout( 20000 );

  before( async () => {

    await service.initAndLoad( config );
    await require( '@openagenda/keys' ).init( config );

  } );

  before( done => {

    fixtures.init( config );

    fixtures( [ {
      table: config.schemas.key,
      src: __dirname + '/fixtures/key.data.sql'
    } ], { reset: false }, done );

  } );

  it( 'update - enable api secret key', done => {

    service.update( 3843,
      { enable_secret: true },
      { internal: true, store: true },
      ( err, result ) => {

        should( err ).equal( null );
        should( result ).eql( {
          user: {
            id: 3843,
            uid: 716130,
            full_name: 'Julien Dargaisse',
            username: 'juliendargaisse',
            email: 'julien.dargaisse@gmail.com',
            culture: 'fr',
            image: null,
            created_at: new Date( '2015-05-01T06:52:42.000Z' ),
            updated_at: new Date( '2016-01-22T08:35:17.000Z' ),
            is_removed: 0,
            is_new: 1,
            store: {
              ES_facebook: false,
              ES_reviews: {
                2794: '2794'
              },
              ES_twitter: false,
              enable_secret: true
            }
          },
          errors: [],
          success: true,
          valid: true
        } );

        done();

      } );

  } );

  it( 'update - set is_new', done => {

    service.update( 3843,
      { is_new: 0 },
      { protected: false },
      ( err, result ) => {

        should( err ).equal( null );
        should( result ).eql( {
          user: {
            id: 3843,
            uid: 716130,
            full_name: 'Julien Dargaisse',
            username: 'juliendargaisse',
            email: 'julien.dargaisse@gmail.com',
            culture: 'fr',
            image: null,
            created_at: new Date( '2015-05-01T06:52:42.000Z' ),
            updated_at: new Date( '2016-01-22T08:35:17.000Z' ),
            is_removed: 0,
            is_new: 0
          },
          errors: [],
          success: true,
          valid: true
        } );

        done();

      } );

  } );

  describe( 'update interfaces', () => {

    // before( async () => {
    //
    //   await service.initAndLoad( _.merge( {}, config, {
    //     interfaces: {
    //       onUpdate( before, user ) {
    //
    //         console.log( 'UPPPP', before, user );
    //
    //       }
    //     }
    //   } ) );
    //   await require( '@openagenda/keys' ).init( config );
    //
    // } );

    it( 'call onUpdate interface after updating', done => {

      service.initAndLoad( _.merge( {}, config, {
        interfaces: {
          onUpdate( before, user ) {

            should( before ).match( {
              full_name: 'Julien Dargaisse',
              culture: 'fr'
            } );

            should( user ).match( {
              full_name: 'Jean-Phil Entoize',
              culture: 'en'
            } );

            done();

          }
        }
      } ) )
        .then( () =>
          service.update( 3843,
            { full_name: 'Jean-Phil Entoize', culture: 'en' },
            { protected: false },
            err => {
              if ( err ) done( err );
            }
          )
        );

    } );

  } );

} );
