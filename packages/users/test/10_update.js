"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.update', function () {

  this.timeout( 20000 );

  before( done => {

    fixtures.init( config );

    fixtures( [ {
      table: config.schemas.user,
      src: __dirname + '/fixtures/user.data.sql'
    }, {
      table: config.schemas.apiKeySet,
      src: __dirname + '/fixtures/api_key_set.data.sql'
    } ], done );

  } );

  before( async () => {

    await service.init( config );

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

} );
