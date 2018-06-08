"use strict";

const http = require( 'http' );
const _ = require( 'lodash' );
const express = require( 'express' );
const axios = require( 'axios' );
const qs = require( 'qs' );
const { expect } = require( 'chai' );
const sinon = require( 'sinon' );
const imageFiles = require( '@openagenda/image-files' );
const fixtures = require( '@openagenda/fixtures' );
const keysSvc = require( '@openagenda/keys/test/service' );
const keysConfig = require( '@openagenda/keys/service/config' );
const usersSvc = require( './service' );
const hooks = require( '../hooks' );
const testconfig = require( '../testconfig' );
const config = require( '../config' );

const database = testconfig.mysql.database + '_integration';

const kaoreUid = 75052324;

beforeEach( async () => {
  await keysSvc.initAndLoad( {
    ...testconfig,
    mysql: { ...testconfig.mysql, database }
  }, [] );
  await usersSvc.initAndLoad( {
    ...testconfig,
    mysql: { ...testconfig.mysql, database }
  }, { reset: false } );
  imageFiles.init( testconfig );

  usersSvc.hooks( hooks );
} );

afterEach( async () => {
  await config.knex.raw( `DROP DATABASE IF EXISTS ${database}` );
  await config.knex.destroy();
  await usersSvc().knex.destroy();
  await keysConfig.knex.destroy();
} );

afterAll( async () => {
  fixtures.getConnection().end();
} );

it( 'no provider - internal usage', async () => {
  const user = await usersSvc().get( kaoreUid );

  expect( user.fullName ).to.be.equal( 'Kari Olafsson' );
} );

describe( 'http provider', () => {
  let app;
  let server;
  let port;

  beforeEach( () => {
    app = express()
      .use( express.urlencoded( { extended: true, limit: '10mb' } ) )
      .use( express.json( { limit: '10mb' } ) )
      .use( ( req, res, next ) => {
        req.feathers = req.feathers || {};
        req.feathers.user = { uid: kaoreUid };
        req.feathers.authenticated = req.authenticated = { uid: kaoreUid };

        next();
      } );

    // get random port for test
    server = http.createServer( app ).listen();
    port = server.address().port;

    // expose service users on the parent app
    usersSvc.exposeApp( app, '/users' );

    app.use( ( err, req, res, next ) => {

      console.log( 'Err', err );
      next();
    } );

    // add hooks to the exposed app
    usersSvc.hooks( hooks );
  } );

  afterEach( () => {
    server.close();
  } );

  /* lock time */
  const now = new Date( _.round( new Date(), -3 ) );
  let clock;

  beforeEach( () => {
    clock = sinon.useFakeTimers( {
      now,
      toFake: Object.keys( sinon.timers ).filter( v => ![ 'nextTick', 'setImmediate' ].includes( v ) )
    } );
  } );

  afterEach( () => {
    clock.restore();
  } );
  /*************/

  it( 'find - return 404 error', async () => {
    try {
      await axios.get( `http://localhost:${port}/users` );
    } catch ( e ) {
      expect( e.response.status ).to.be.equal( 404 );
    }
  } );

  it( 'refresh - post with data', async () => {
    const { data: user } = await axios.post( `http://localhost:${port}/users/${kaoreUid}/refresh`, {
      lastSignin: true
    }, {
      params: {
        $client: {
          detailed: true
        }
      },
      paramsSerializer: qs.stringify
    } ).catch( err => {

      console.log( 'Dla merde', err );
    } );

    expect( user.lastSignin ).to.be.equal( now.toISOString() );
  } );

  it( 'confirmChangeEmail - test for query', () => {
    //
  } );
} );
