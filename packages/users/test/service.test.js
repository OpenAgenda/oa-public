"use strict";

const fs = require( 'fs' );
const path = require( 'path' );
const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const { expect } = require( 'chai' );
const sinon = require( 'sinon' );
const tmp = require( 'tmp' );
const imageFiles = require( '@openagenda/image-files' );
const fixtures = require( '@openagenda/fixtures' );
const keysSvc = require( '@openagenda/keys/test/service' );
const keysConfig = require( '@openagenda/keys/service/config' );
const usersSvc = require( './service' );
const crypto = require( '../service/lib/crypto' );
const testconfig = require( '../testconfig' );
const config = require( '../config' );

const database = testconfig.mysql.database + '_service';

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

describe( 'initialization', () => {
  it( 'simple initialization', async () => {
    const user = await usersSvc().get( kaoreUid );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );
  } );

  it( 'init with a knex instance', async () => {
    const knex = knexLib( {
      client: 'mysql',
      connection: {
        ...testconfig.mysql,
        database
      }
    } );

    await keysSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database },
      knex
    } );
    await usersSvc.initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database },
      knex
    }, { reset: false } );

    const user = await usersSvc().get( kaoreUid );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );

    await knex.destroy();
  } );
} );

describe( 'get', () => {
  it( 'get a removed user', async () => {
    const user = await usersSvc().get( kaoreUid );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );
  } );
} );

describe( 'setImageProfile', () => {
  it( 'setImageProfile with a path', async () => {
    const tmpFile = tmp.fileSync();

    fs.createReadStream( path.join( __dirname, 'files/phteven.jpg' ) )
      .pipe( fs.createWriteStream( tmpFile.name ) );

    const result = await usersSvc().setImageProfile( kaoreUid, {
      path: tmpFile.name
    } );

    expect( result.uploadedPaths ).to.have.lengthOf( 3 );
  } );
} );

describe( 'clearImageProfile', () => {
  it( 'clear image profile of a user', async () => {
    await usersSvc().clearImageProfile( kaoreUid );

    const user = await usersSvc().get( kaoreUid );

    expect( user.image ).to.be.null;
  } );
} );

describe( 'create', () => {
  it( 'create a user with an already taken email', async () => {
    await expect(
      usersSvc().create( { email: 'gaetan@cibul.net', password: 'pa**word' } )
    ).to.be.rejectedWith( Error, 'Already exist' );
  } );
} );

describe( 'patch', () => {
  it( 'patch language of a user', async () => {
    const result = await usersSvc().patch( kaoreUid, { culture: 'is' } );

    expect( result.culture ).to.equal( 'is' );
  } );

  it( 'patch user with a too long language', async () => {
    const error = await expect(
      usersSvc().patch( kaoreUid, { culture: 'francaisDeFrânce' } )
    ).to.be.rejected;

    expect( error.errors ).to.have.lengthOf( 1 );
    expect( error.errors[ 0 ] ).to.include( {
      field: 'culture',
      code: 'string.toolong'
    } );
  } );
} );

describe( 'requestChangeEmail', () => {
  it( 'basic requestChangeEmail', async () => {
    const user = await usersSvc().requestChangeEmail( kaoreUid, { newEmail: 'jean-meaurice@hotmail.fr' } );

    expect( user.store.newEmail ).to.be.equal( 'jean-meaurice@hotmail.fr' );
    expect( user.store.newEmailToken ).to.have.lengthOf( 32 );
  } );

  it( 'attempt to requestChangeEmail with an already taken email', async () => {
    await expect(
      usersSvc().requestChangeEmail( kaoreUid, { newEmail: 'romain.lange@gmail.com' } )
    ).to.be.rejectedWith( Error, 'Already exist' );
  } );

  it( 'attempt to requestChangeEmail with a bad email', async () => {
    const error = await expect(
      usersSvc().requestChangeEmail( kaoreUid, { newEmail: 'romain.langegmail.com' } )
    ).to.be.rejected;

    expect( error.errors ).to.have.lengthOf( 1 );
    expect( error.errors[ 0 ] ).to.include( {
      field: 'newEmail',
      code: 'email.invalid'
    } );
  } );
} );

describe( 'confirmChangeEmail', () => {
  it( 'basic confirmChangeEmail', async () => {
    const user = await usersSvc().confirmChangeEmail( kaoreUid, {
      query: {
        token: 'e4a0f1c97b2f4ca7966f069e7b090c0d'
      }
    } );

    expect( user.email ).to.be.equal( 'jean-bernard@gmail.com' );
    expect( user.store.newEmail ).to.be.undefined;
    expect( user.store.newEmailToken ).to.be.undefined;
  } );

  it( 'attempt to change his email for an email taken in the meantime', async () => {
    await expect(
      usersSvc().confirmChangeEmail( 17133001, {
        query: {
          token: '87071649646742ee8dce48e4eb1dc0b0'
        }
      } )
    ).to.be.rejectedWith( Error, 'Already exist' );
  } );

  it( 'attempt to change email with a bad token in the query', async () => {
    await expect(
      usersSvc().confirmChangeEmail( 17133001, {
        query: {
          token: '87071649646742ee8dce48e4eb1dccbd'
        }
      } )
    ).to.be.rejectedWith( Error, 'Bad token' );
  } );
} );

describe( 'changePassword', () => {
  it( 'change password', async () => {
    const password = 'lab***adudule';

    const user = await usersSvc().changePassword( 17133001, {
      password
    } );

    expect( user.password ).to.be.equal( crypto.hashPassword( password, user.salt ) );
  } );

  it( 'change password - validation fail', async () => {
    const password = null;

    const error = await expect(
      usersSvc().changePassword( 17133001, {
        password
      } )
    ).to.be.rejected;

    expect( error.errors ).to.have.lengthOf( 1 );
    expect( error.errors[ 0 ] ).to.include( {
      field: 'password',
      code: 'required'
    } );
  } );
} );

describe( 'generateApiKey', () => {
  it( 'generate new api public key', async () => {
    const user = await usersSvc().generateApiKey( 17133001, {
      publicKey: true,
      secretKey: true
    } );

    expect( user.apiSecret ).to;
  } );
} );

describe( 'remove', () => {
  it( 'remove a user', async () => {
    const user = await usersSvc().remove( 17133001 );

    expect( user.isRemoved ).to.be.equal( true );

    const modifiedUser = await usersSvc().get( 17133001 );

    expect( modifiedUser ).to.be.null;
  } );
} );

describe( 'setNewFlag', () => {
  it( 'set a new flag to true', async () => {
    const user = await usersSvc().get( 17133001 );

    expect( user.isNew ).to.be.equal( true );

    const modifiedUser = await usersSvc().setNewFlag( 17133001, {
      isNew: false
    } );

    expect( modifiedUser.isNew ).to.be.equal( false );
  } );
} );

describe( 'refresh', () => {

  const now = new Date( _.floor( new Date(), -3 ) );
  let clock;

  beforeEach( () => {
    clock = sinon.useFakeTimers( { now } );
  } );

  afterEach( () => {
    clock.restore();
  } );

  it( 'refresh lastSignin', async () => {
    const user = await usersSvc().refresh( 17133001, {
      lastSignin: true
    } );

    expect( user.lastSignin ).to.eql( now );
  } );

  it( 'refresh lastInboxCheck', async () => {
    const user = await usersSvc().refresh( 17133001, {
      lastInboxCheck: true
    } );

    expect( user.lastInboxCheck ).to.eql( now );
  } );

  it( 'refresh lastNotified', async () => {
    const user = await usersSvc().refresh( 17133001, {
      lastNotified: true
    } );

    expect( user.lastNotified ).to.eql( now );
  } );
} );
