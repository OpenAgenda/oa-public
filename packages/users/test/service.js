"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' );


describe( 'service', function () {

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

  before( done => {

    service.init( config, done );

  } );

  it( 'list', done => {

    service.list( 0, 10, ( err, users ) => {

      should( err ).equal( null );

      service.list( 4, 1, ( err, offsetUsers ) => {

        should( err ).equal( null );
        users.length.should.equal( 10 );
        offsetUsers.length.should.equal( 1 );
        users[ 4 ].id.should.equal( offsetUsers[ 0 ].id );

        done();

      } );

    } );

  } );

  it( 'get by id', done => {

    service.get( { id: 2 }, ( err, user ) => {

      should( err ).equal( null );
      user.email.should.equal( 'romain.lange@gmail.com' );

      done();

    } );

  } );

  it( 'get by uid', done => {

    service.get( { uid: 99999999 }, ( err, user ) => {

      should( err ).equal( null );
      user.email.should.equal( 'romain.lange@gmail.com' );

      done();

    } );

  } );

  it( 'get by email', done => {

    service.get( { email: 'romain.lange@gmail.com' }, ( err, user ) => {

      should( err ).equal( null );
      user.email.should.equal( 'romain.lange@gmail.com' );

      done();

    } );

  } );

  it( 'get inexistent user', done => {

    service.get( { email: 'blablabla@sorry.com' }, ( err, user ) => {

      should( err ).equal( null );
      should( user ).equal( null );

      done();

    } );

  } );

  it( 'get user with detailed options', done => {

    service.get( { id: 2 }, { detailed: true }, ( err, user ) => {

      should( err ).equal( null );
      should( user ).have.property( 'api_key' );
      should( user ).have.property( 'facebook_uid' );
      should( user ).have.property( 'last_signin' );

      done();

    } );

  } );

  it( 'set', done => {

    service.set( { id: 2, full_name: 'Romain' }, ( err, result ) => {

      should( err ).equal( null );
      result.user.email.should.equal( 'romain.lange@gmail.com' );
      result.user.full_name.should.equal( 'Romain' );

      done();

    } );

  } );

  it( 'set inexistent user', done => {

    service.set( { id: 987654321, full_name: 'Je fais du caca là !' }, ( err, result ) => {

      should( err ).equal( null );
      should( result.user ).equal( null );

      done();

    } );

  } );

  it( 'create', done => {

    service.set( {
      full_name: 'Test et retest',
      email: 'test.test@openagenda.com',
      culture: 'fr',
      password: 'passwooord'
    }, ( err, result ) => {

      should( err ).equal( null );

      service.get( { id: result.user.id }, ( err, user ) => {

        should( err ).equal( null );
        user.full_name.should.equal( 'Test et retest' );
        user.email.should.equal( 'test.test@openagenda.com' );

        done();

      } );

    } );

  } );

  it( 'create user with bad info', done => {

    service.set( {
      full_name: 'Test et retest',
      email: 'cestpasunemailca',
      culture: 'frolala'
    }, ( err, result ) => {

      should( err ).equal( null );
      result.errors.length.should.equal( 2 );

      done();

    } );

  } );

  it( 'update profile', done => {

    service.updateProfile( { id: 2, full_name: 'Nouveau ptit nom', culture: 'en' }, ( err, result ) => {

      should( err ).equal( null );

      service.get( { id: 2 }, { detailed: true }, ( err, user ) => {

        should( err ).equal( null );
        user.full_name.should.equal( 'Nouveau ptit nom' );
        user.culture.should.equal( 'en' );

        done();

      } );

    } );

  } );

  it( 'update profile with bad info', done => {

    service.updateProfile( { id: 2, culture: 'rhaaaa' }, ( err, result ) => {

      should( err ).equal( null );
      result.errors[ 0 ].code.should.equal( 'string.toolong' );

      done();

    } );

  } );

  it( 'verify password', done => {

    service.verifyPassword( { email: 'gaetan@cibul.net', password: 'cibulon' }, ( err, result ) => {

      should( err ).equal( null );
      should( result ).equal( true );

      done();

    } );

  } );

  it( 'change password', done => {

    service.changePassword( {
      id: 119,
      new_password: 'openagendon'
    }, ( err, result ) => {

      should( err ).equal( null );

      service.verifyPassword( { email: 'gaetan@cibul.net', password: 'openagendon' }, ( err, result ) => {

        should( err ).equal( null );
        should( result ).equal( true );

        done();

      } );

    } );

  } );

  it( 'change email', done => {

    service.requestChangeEmail( {
      id: 119,
      email: 'gaetan@openagenda.com'
    }, ( err, result ) => {

      should( err ).equal( null );

      service.confirmChangeEmail( {
        id: 119,
        token: result.token
      }, ( err, result ) => {

        should( err ).equal( null );
        result.should.equal( true );

        service.get( { id: 119 }, ( err, user ) => {

          should( err ).equal( null );
          user.email.should.equal( 'gaetan@openagenda.com' );

          done();

        } );

      } );

    } );

  } );

  it( 'change email with already taken', done => {

    service.requestChangeEmail( {
      id: 2,
      email: 'gaetan@openagenda.com'
    }, ( err, result ) => {

      should( err ).equal( null );
      result.errors[ 0 ].code.should.equal( 'email.alreadytaken' );

      done();

    } );

  } );

  it( 'regenerate public api key', done => {

    service.get( { id: 119 }, ( err, user ) => {

      should( err ).equal( null );

      service.generateApiKey( { id: 119 }, ( err, result ) => {

        should( err ).equal( null );
        should( result.key ).not.equal( user.api_key );

        done();

      } );

    } );

  } );

  it( 'generate new public api key', done => {

    service.get( { id: 439 }, ( err, user ) => {

      should( err ).equal( null );

      service.generateApiKey( { id: 439 }, ( err, result ) => {

        should( err ).equal( null );
        should( result.key ).not.equal( user.api_key );

        done();

      } );

    } );

  } );

  it( 'generate secret api key', done => {

    service.get( { id: 1 }, { detailed: true }, ( err, user ) => {

      should( err ).equal( null );

      service.generateApiKey( { id: 1 }, { secret: true }, ( err, result ) => {
        
        should( err ).equal( null );
        should( result.key ).not.equal( user.api_secret );

        done();

      } );

    } );

  } );

  it( 'delete user', done => {

    service.remove( { id: 119 }, ( err, result ) => {

      should( err ).equal( null );
      result.should.equal( true );

      service.get( { id: 119 }, ( err, user ) => {

        should( err ).equal( null );
        should( user ).equal( null );

        done();

      } );

    } );

  } );

} );