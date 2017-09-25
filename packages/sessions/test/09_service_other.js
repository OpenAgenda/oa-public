"use strict";

const sessions = require( '../' );
const should = require( 'should' );
const config = require( '../testconfig' );
const isoConfig = require( '../iso/config' );
const h = require( './lib/helpers' );
const serviceHelpers = require( '../service/helpers' );
const extend = require( 'lodash/extend' );
const _ = require( 'lodash' );
const async = require( 'async' );

const users = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/lib/users.json', 'utf-8' ) );

h.init( config );

describe( 'session - functional (server): isLogged & getCulture', () => {

  let request;

  beforeEach( h.clearRedis );

  before( () => sessions.init( config ) );

  afterEach( () => sessions.shutdown() );

  beforeEach( () => {

    request = { cookies: {}, session: {} };

    request.cookies[ isoConfig.cookies.session ] = 'therandomsessioncode';

  } );

  describe( '.isLogged', () => {

    beforeEach( done => {

      sessions.open( request, { uid: 12345678 }, done.bind( null, null ) );

    } );

    it( 'determines based on request when user is logged', async () => {

      let req = {
        session: {
          user: {
            name: 'gaetan',
            uid: 12345678,
            culture: 'fr'
          }
        },
        cookies: {}
      };

      req.cookies[ isoConfig.cookies.session ] = 'therandomsessioncode';

      ( await sessions.isLogged( req ) ).should.equal( true );

    } );

    it( '.. and when the user is not logged', async () => {

      const req = {
        session: {},
        cookies: {}
      };

      req.cookies[ isoConfig.cookies.session ] = 'therandomsessioncode';

      ( await sessions.isLogged( req ) ).should.equal( false );

    } );

  } );

  describe( 'helpers', () => {

    it( 'helpers.cleanSession does not remove keys from session object', () => {

      let session = { somekey: '123' };

      serviceHelpers.cleanSession( session ).should.eql( { somekey: '123' } );

    } );

  } );

  describe( '.getCulture', () => {

    it( 'gets culture when user is logged', () => {

      const req = {
        session: {
          user: { name: 'gaetan', uid: 123, culture: 'en' }
        }
      }

      sessions.getCulture( req ).should.equal( 'en' );

    } );

    it( 'returns null when user is not logged', () => {

      const req = {
        session: {}
      };

      should( sessions.getCulture( req ) ).equal( null );

    } );

  } );

} ); 