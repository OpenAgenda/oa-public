"use strict";

const http = require( 'http' );
const express = require( 'express' );
const axios = require( 'axios' );
const knexLib = require( 'knex' );
const { expect } = require( 'chai' );
const usersSvc = require( '../index' );
const testconfig = require( '../testconfig' );

describe( 'initialization', () => {
  it( 'express | http + service', async () => {
    usersSvc.init( testconfig );

    const app = express();

    // expose service users on the parent app
    usersSvc.exposeApp( app, '/users' );

    // get random port for test
    const server = http.createServer( app ).listen();
    const port = server.address().port;

    // Usage by http request
    const { data: page } = await axios.get( `http://localhost:${port}/users` );
    expect( page.data ).to.have.property( 'length' ).that.to.be.equal( 20 );

    // Usage by service
    const service = usersSvc();
    const user = await service.get( 75052324 );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );
    expect( service ).to.include.all.keys(
      'find', 'get', 'create', 'patch', 'update', 'remove',
      'hooks', 'on', 'once', 'emit', 'events'
    );

    server.close();
    await service.knex.destroy();
  } );

  it( 'just service', async () => {
    usersSvc.init( testconfig );

    const service = usersSvc();
    const user = await service.get( 75052324 );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );

    await service.knex.destroy();
  } );

  it( 'init with a knex instance', async () => {
    const knex = knexLib( {
      client: 'mysql',
      connection: testconfig.mysql
    } );

    usersSvc.init( {
      ...testconfig,
      knex
    } );

    const service = usersSvc();
    const user = await service.get( 75052324 );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );

    await service.knex.destroy();
  } );
} );
