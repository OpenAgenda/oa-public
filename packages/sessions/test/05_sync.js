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

describe( 'session - functional (server): sync', () => {

  h.init( config );

  let request;

  beforeEach( h.clearRedis );

  beforeEach( () => sessions.init( config ) );

  afterEach( () => sessions.shutdown() );

  beforeEach( () => {

    request = { cookies: {}, session: {} };

    request.cookies[ isoConfig.cookies.session ] = 'therandomsessioncode';

  } );

  it( 'sync is used only when a session is open', done => {

    sessions.sync( request, ( err, result ) => {

      result.success.should.equal( false );

      done();

    } );

  } );

  it( 'sync updates session with data fetched from getUser interface', done => {

    sessions.open( request, { uid: 1234 }, () => {

      // the data fetched from getUser changes a bit
      sessions.init( _.extend( {}, config, {
        interfaces: {
          getUser: ( query, cb ) => {

            cb( null, {
              id: 1,
              uid: 1234,
              email: 'blorg@cibul.net',
              culture: 'en',
              name: 'Gaetanne',
              thumbnail: null
            } );

          }
        }
      } ) );

      sessions.sync( request, ( err, result ) => {

        result.success.should.equal( true );

        result.data.culture.should.equal( 'en' );

        done();

      } );

    } );

  } );

} );