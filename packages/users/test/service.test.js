"use strict";

const fs = require( 'fs' );
const path = require( 'path' );
const http = require( 'http' );
const express = require( 'express' );
const axios = require( 'axios' );
const knexLib = require( 'knex' );
const { expect } = require( 'chai' );
const tmp = require( 'tmp' );
const imageFiles = require( '@openagenda/image-files' );
const fixtures = require( '@openagenda/fixtures' );
const usersSvc = require( './service' );
const testconfig = require( '../testconfig' );
const config = require( '../config' );

const kaoreUid = 75052324;

const database = testconfig.mysql.database + '_service';

afterEach( async () => {
  await config.knex.raw( `DROP DATABASE IF EXISTS ${database}` );
  await config.knex.destroy();
} );

afterAll( () => {
  fixtures.getConnection().end();
} );

describe( 'initialization', () => {
  it( 'express | http + service', async () => {
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    } );

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
    const user = await service.get( kaoreUid );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );
    expect( service ).to.include.all.keys(
      'find', 'get', 'create', 'patch', 'update', 'remove',
      'hooks', 'on', 'once', 'emit', 'events'
    );

    server.close();
    await service.knex.destroy();
  } );

  it( 'just service', async () => {
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    } );

    const service = usersSvc();
    const user = await service.get( kaoreUid );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );

    await service.knex.destroy();
  } );

  it( 'init with a knex instance', async () => {
    const knex = knexLib( {
      client: 'mysql',
      connection: {
        ...testconfig.mysql,
        database
      }
    } );

    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database },
      knex
    } );

    const service = usersSvc();
    const user = await service.get( kaoreUid );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );

    await service.knex.destroy();
  } );
} );


describe( 'setImageProfile', () => {
  it( 'setImageProfile with a path', async () => {
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    } );
    imageFiles.init( testconfig );

    const service = usersSvc();
    const tmpFile = tmp.fileSync();

    fs.createReadStream( path.join( __dirname, 'files/phteven.jpg' ) )
      .pipe( fs.createWriteStream( tmpFile.name ) );

    const result = await service.setImageProfile( kaoreUid, {
      path: tmpFile.name
    } );

    expect( result.uploadedPaths ).to.have.property( 'length' ).that.equal( 3 );

    await service.knex.destroy();
  } );
} );

describe( 'clearImageProfile', () => {
  it( 'clear image profile of a user', async () => {
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    } );
    imageFiles.init( testconfig );

    const service = usersSvc();

    await service.clearImageProfile( kaoreUid );

    const user = await service.get( kaoreUid );

    expect( user.image ).to.be.null;

    await service.knex.destroy();
  } );
} );

describe( 'create', () => {
  it( 'create a user with an already taken email', async () => {
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    } );

    const service = usersSvc();

    await expect(
      service.create( { email: 'gaetan@cibul.net' } )
    ).to.be.rejectedWith( Error, 'Already exist' );

    await service.knex.destroy();
  } );
} );

describe( 'patch', () => {
  it( 'patch language of a user', async () => {
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    } );

    const service = usersSvc();
    const result = await service.patch( kaoreUid, { culture: 'is' } );

    expect( result.culture ).to.equal( 'is' );

    await service.knex.destroy();
  } );

  it( 'patch user with a too long language', async () => {
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    } );

    const service = usersSvc();

    const error = await expect(
      service.patch( kaoreUid, { culture: 'francaisDeFrânce' }, { provider: 'rest' } )
    ).to.be.rejected;

    expect( error.errors.length ).to.be.equal( 1 );
    expect( error.errors[ 0 ] ).to.include( {
      field: 'culture',
      code: 'string.toolong'
    } );

    await service.knex.destroy();
  } );
} );

describe( 'requestChangeEmail', () => {
  it( 'basic requestChangeEmail', async () => {
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    } );

    const service = usersSvc();

    const user = await service.requestChangeEmail( kaoreUid, { newEmail: 'jean-meaurice@hotmail.fr' } );

    expect( user.store.newEmail ).to.be.equal( 'jean-meaurice@hotmail.fr' );
    expect( user.store.newEmailToken ).to.have.lengthOf( 32 );

    await service.knex.destroy();
  } );

  it( 'try to requestChangeEmail with an already taken email', async () => {
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    } );

    const service = usersSvc();

    await expect(
      service.requestChangeEmail( kaoreUid, { newEmail: 'romain.lange@gmail.com' } )
    ).to.be.rejectedWith( Error, 'Already exist' );

    await service.knex.destroy();
  } );

  it( 'try to requestChangeEmail with a bad email', async () => {
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    } );

    const service = usersSvc();

    const error = await expect(
      service.requestChangeEmail( kaoreUid, { newEmail: 'romain.langegmail.com' } )
    ).to.be.rejected;

    expect( error.errors.length ).to.be.equal( 1 );
    expect( error.errors[ 0 ] ).to.include( {
      field: 'newEmail',
      code: 'email.invalid'
    } );

    await service.knex.destroy();
  } );
} );
