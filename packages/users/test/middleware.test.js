"use strict";

const fs = require( 'fs' );
const path = require( 'path' );
const { promisify } = require( 'util' );
const stream = require( 'stream' );
const { expect } = require( 'chai' );
const FormData = require( 'form-data' );
const imageFiles = require( '@openagenda/image-files' );
const fixtures = require( '@openagenda/fixtures' );
const keysSvc = require( '@openagenda/keys/test/service' );
const usersSvc = require( './service' );
const mw = require( '../middleware' );
const testconfig = require( '../testconfig' );
const config = require( '../config' );
const keysConfig = require( '@openagenda/keys/service/config' );

const database = testconfig.mysql.database + '_middleware';

const kaoreUid = 75052324;


beforeEach( async () => {
  await keysSvc.initAndLoad( {
    ...testconfig,
    mysql: { ...testconfig.mysql, database }
  } );
  await usersSvc.initAndLoad( {
    ...testconfig,
    mysql: { ...testconfig.mysql, database }
  }, { reset: false } );
  imageFiles.init( testconfig );
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

describe( 'load', () => {
  it( 'load a user from his uid', async () => {
    const req = { user: { uid: kaoreUid } };

    await promisify( mw.load() )( req, {} );

    expect( req.user.fullName ).to.be.equal( 'Kari Olafsson' );
  } );

  it( 'load a user from his id', async () => {
    const req = { user: { id: 2 } };

    await promisify( mw.load() )( req, {} );

    expect( req.user.fullName ).to.be.equal( 'Romain Lange - OpenAgenda' );
  } );

  it( 'throws an error when neither the id nor the uid is provided', async () => {
    await expect(
      promisify( mw.load() )( {}, {} )
    ).to.be.rejectedWith( Error, 'Id or uid is required for load user' );
  } );

  it( 'throws an error when user is not found', async () => {
    const req = { user: { id: 987654 } };

    await expect(
      promisify( mw.load() )( req, {} )
    ).to.be.rejectedWith( Error, 'No user found for {"id":987654}' );
  } );
} );

describe( 'setImageProfile', () => {
  it( 'upload new image profile', async done => {
    const req = new stream.PassThrough();
    req.user = {
      uid: kaoreUid
    };

    const res = {
      async send() {
        expect( req.result.uploadedPaths ).to.have.property( 'length' ).that.equal( 3 );
        done();
      }
    };

    const form = new FormData();
    const image = fs.createReadStream( path.join( __dirname, 'files/phteven.jpg' ) );
    form.append( 'image', image );

    form.pipe( req );
    req.headers = {
      'content-type': 'multipart/form-data; boundary=' + form.getBoundary(),
      'content-length': await promisify( form.getLength ).call( form )
    }

    mw.setImageProfile()( req, res );
  } );
} );

describe( 'clearImageProfile', () => {
  it( 'clear image profile of Kaoré', async () => {
    const req = { user: { uid: kaoreUid } };
    const res = {};

    await expect(
      promisify( mw.clearImageProfile() )( req, res )
    ).to.be.fulfilled;

    const user = await usersSvc().get( kaoreUid );

    expect( user.image ).to.be.null;
    expect( res.data ).to.be.eql( { success: true } );
  } );
} );

describe( 'requestChangeEmail', () => {

} );
