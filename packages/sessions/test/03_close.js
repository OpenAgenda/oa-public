"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const async = require( 'async' );
const should = require( 'should' );
const sessions = require( '../src/service' );
const isoConfig = require( '../src/iso/config' );
const config = require( '../testconfig' );
const h = require( './lib/helpers' );

const users = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/lib/users.json', 'utf-8' ) );

describe( 'session - functional (server): close', () => {
  let client;
  let request;

  beforeEach(async () => {
    client = await h.createClient(config.redis);
  });

  beforeEach(() => h.clearRedis(config.redis, client));

  beforeEach(() => sessions.init({
    ...config,
    redisClient: client,
  }));

  beforeEach(() => {
    request = {
      cookies: {},
      session: {}
    };

    request.cookies[isoConfig.cookies.session] = 'therandomsessioncode';
  });

  afterEach(() => client.quit());

  it( 'close ends the session using the request object', done => {

    sessions.open( request, { uid: 12345678 }, ( err, result ) => {

      sessions.close( request, ( err, result ) => {

        result.success.should.equal( true );

        done();

      } );

    } );

  } );

  it( 'request session is nulled', done => {

    sessions.open( request, { uid: 12345678 }, ( err, result ) => {

      sessions.close( request, ( err, result ) => {

        should( request.session ).equal( null );          

        done();

      } );

    } );

  } );

  it( 'redis store of session is emptied', done => {

    sessions.open( request, { uid: 12345678 }, ( err, result ) => {

      client.get([config.redis.prefix, 12345678].join(':')).then(result => {

        JSON.parse( result ).email.should.equal( 'gaetan@cibul.net' );

        sessions.close( request, ( err, result ) => {

          client.get([config.redis.prefix, 12345678].join(':')).then(result => {

            should( err ).equal( null );
            should( result ).equal( null );

            done();

          } );

        } );

      } );

    } );

  } );

} );