"use strict";

const fs = require( 'fs' );
const path = require( 'path' );
const { promisify } = require( 'util' );
const stream = require( 'stream' );
const { expect } = require( 'chai' );
const FormData = require( 'form-data' );
const imageFiles = require( '@openagenda/image-files' );
const usersSvc = require( '../index' );
const mw = require( '../middleware' );
const testconfig = require( '../testconfig' );

const kaoreUid = 75052324;


describe( 'load', () => {
  it( 'load a user from his uid', async () => {
    usersSvc.init( testconfig );

    const req = { user: { uid: kaoreUid } };

    await promisify( mw.load() )( req, {} );

    expect( req.user.fullName ).to.be.equal( 'Kari Olafsson' );

    await usersSvc().knex.destroy();
  } );

  it( 'load a user from his id', async () => {
    usersSvc.init( testconfig );

    const req = { user: { id: 2 } };

    await promisify( mw.load() )( req, {} );

    expect( req.user.fullName ).to.be.equal( 'Romain Lange - OpenAgenda' );

    await usersSvc().knex.destroy();
  } );

  it( 'throws an error when neither the id nor the uid is provided', async () => {
    usersSvc.init( testconfig );

    await expect(
      promisify( mw.load() )( {}, {} )
    ).to.be.rejected;

    await usersSvc().knex.destroy();
  } );
} );

describe( 'setImageProfile', () => {
  it( 'upload new image profile', async done => {
    usersSvc.init( testconfig );
    imageFiles.init( testconfig );

    const req = new stream.PassThrough();
    req.user = {
      uid: kaoreUid
    };

    const res = {
      async send() {
        expect( req.result.uploadedPaths ).to.have.property( 'length' ).that.equal( 3 );

        await usersSvc().knex.destroy();
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
    usersSvc.init( testconfig );

    const req = { user: { uid: kaoreUid } };

    await expect(
      promisify( mw.clearImageProfile() )( req, {} )
    ).to.be.fulfilled;

    const user = await usersSvc().get( kaoreUid );

    expect( user.image ).to.be.null;

    await usersSvc().knex.destroy();
  } );
} );
