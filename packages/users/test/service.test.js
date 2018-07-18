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
const hooks = require( '../hooks' );
const crypto = require( '../utils/crypto' );
const testconfig = require( '../testconfig' );
const config = require( '../config' );

const database = testconfig.mysql.database + '_service';

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

describe( 'initialization', () => {
  it( 'simple initialization', async () => {
    const user = await usersSvc.get( kaoreUid );

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

    usersSvc.hooks( hooks );

    const user = await usersSvc.get( kaoreUid );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );

    await knex.destroy();
  } );
} );

describe( 'get', () => {
  it( 'get a user', async () => {
    const user = await usersSvc.get( kaoreUid );

    expect( user.fullName ).to.be.equal( 'Kari Olafsson' );
  } );

  it( 'get inexistent user', async () => {
    const user = await usersSvc.get( 86861664 );

    expect( user ).to.be.equal( null );
  } );

  it( 'get user with detailed option', async () => {
    const user = await usersSvc.get( kaoreUid, { detailed: true } );

    expect( user ).to.include.all.keys( 'isRemoved', 'isActivated' );
  } );

  it( 'get user with removed option at null', async () => {
    const user = await usersSvc.get( 9003991, { removed: null } );

    expect( user.email ).to.be.equal( 'contact@dedale.info' );
    expect( user ).to.not.include.all.keys( 'isRemoved', 'isActivated' );
  } );

  it( 'get user with includeImagePath', async () => {
    const user = await usersSvc.get( 75052324, { includeImagePath: true } );

    expect( user.image ).to.be.equal( '//openagendatst.s3.amazonaws.com/review_kaore-olafsson_01.jpg' );
    expect( user.email ).to.be.equal( 'kaoreolafsson@gmail.com' );
  } );

  it( 'returns apiKey and secretKey', async () => {
    const user = await usersSvc.get( 99999999, { provider: 'rest' } );

    expect( user.apiKey ).to.be.equal( '317e316466a629c8dacd4aa81f39c930' );
    expect( user.apiSecret ).to.be.equal( null );
  } );
} );

describe( 'find', () => {
  it( 'find with a search query', async () => {
    const { total, data: users } = await usersSvc.find( {
      query: {
        $search: 'latouche'
      }
    } );

    expect( total ).to.be.equal( 1 );
    expect( users[ 0 ] ).to.include( {
      fullName: 'Gaetan Latouche'
    } );
  } );

  it( 'find with uid query', async () => {
    const { total, data: users } = await usersSvc.find( {
      query: {
        uid: {
          $in: [ 54505079, 27639980 ]
        }
      }
    } );

    expect( total ).to.be.equal( 2 );
    expect( users.map( v => v.uid ) ).to.be.eql( [ 27639980, 54505079 ] );
  } );

  it( 'find with detailed param', async () => {
    const { data: users } = await usersSvc.find( {
      query: {
        $search: 'latouche'
      },
      detailed: true
    } );

    expect( users[ 0 ] ).to.include.all.keys( 'isRemoved', 'isActivated' );
  } );

  it( 'find with removed param at true', async () => {
    const { total, data: users } = await usersSvc.find( {
      removed: true,
      detailed: true
    } );

    expect( total ).to.be.equal( 1 );
    expect( users[ 0 ] ).to.include( {
      isRemoved: true
    } );
  } );

  it( 'find with removed param at false', async () => {
    const { total, data: users } = await usersSvc.find( {
      removed: false,
      detailed: true
    } );

    expect( total ).to.be.equal( 25 );
    expect( users[ 0 ] ).to.include( {
      isRemoved: false
    } );
  } );

  it( 'find with removed param at null', async () => {
    const { total } = await usersSvc.find( {
      removed: null,
      detailed: true
    } );

    expect( total ).to.be.equal( 26 );
  } );

  it( 'findOne by email', async () => {
    const email = 'romain.lange@gmail.com';

    const user = await usersSvc.findOne( {
      query: {
        email
      }
    } );

    expect( user.email ).to.be.equal( email );
  } );

  it( 'findOne by key', async () => {
    const key = '317e316466a629c8dacd4aa81f39c930';

    const user = await usersSvc.findOne( {
      query: {
        key
      }
    } );

    expect( user.apiKey ).to.be.equal( key );
  } );
} );

describe( 'setImageProfile', () => {
  it( 'setImageProfile with a path', async () => {
    const tmpFile = tmp.fileSync();

    fs.createReadStream( path.join( __dirname, 'files/phteven.jpg' ) )
      .pipe( fs.createWriteStream( tmpFile.name ) );

    const result = await usersSvc.setImageProfile( kaoreUid, {
      path: tmpFile.name
    } );

    expect( result.uploadedPaths ).to.have.lengthOf( 3 );
  } );
} );

describe( 'clearImageProfile', () => {
  it( 'clear image profile of a user', async () => {
    await usersSvc.clearImageProfile( kaoreUid );

    const user = await usersSvc.get( kaoreUid );

    expect( user.image ).to.be.null;
  } );
} );

describe( 'create', () => {
  it( 'create a user with an already taken email', async () => {
    await expect(
      usersSvc.create( { email: 'gaetan@cibul.net', password: 'pa**word' } )
    ).to.be.rejectedWith( Error, 'Already exist' );
  } );

  it( 'create an activated user', async () => {
    const user = await usersSvc.create(
      { email: 'jean-eude@oa.com', password: 'pa**word', isActivated: true },
      { detailed: true }
    );

    expect( user.isActivated ).to.be.equal( true );
  } );
} );

describe( 'patch', () => {
  it( 'patch language of a user', async () => {
    const result = await usersSvc.patch( kaoreUid, { culture: 'is' } );

    expect( result.culture ).to.equal( 'is' );
  } );

  it( 'patch user with a too long language', async () => {
    const error = await expect(
      usersSvc.patch( kaoreUid, { culture: 'francaisDeFrânce' } )
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
    await usersSvc.requestChangeEmail( kaoreUid, { newEmail: 'jean-meaurice@hotmail.fr' } );

    const internalUser = await usersSvc.get( kaoreUid, { internal: true } );

    expect( internalUser.store.newEmail ).to.be.equal( 'jean-meaurice@hotmail.fr' );
    expect( internalUser.store.newEmailToken ).to.have.lengthOf( 32 );
  } );

  it( 'attempt to requestChangeEmail with an already taken email', async () => {
    await expect(
      usersSvc.requestChangeEmail( kaoreUid, { newEmail: 'romain.lange@gmail.com' } )
    ).to.be.rejectedWith( Error, 'Already exist' );
  } );

  it( 'attempt to requestChangeEmail with a bad email', async () => {
    const error = await expect(
      usersSvc.requestChangeEmail( kaoreUid, { newEmail: 'romain.langegmail.com' } )
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
    const user = await usersSvc.confirmChangeEmail( kaoreUid, {
      query: {
        token: 'e4a0f1c97b2f4ca7966f069e7b090c0d'
      }
    } );

    const internalUser = await usersSvc.get( kaoreUid, { internal: true } );

    expect( user.email ).to.be.equal( 'jean-bernard@gmail.com' );
    expect( internalUser.store.newEmail ).to.be.undefined;
    expect( internalUser.store.newEmailToken ).to.be.undefined;
  } );

  it( 'attempt to change his email for an email taken in the meantime', async () => {
    await expect(
      usersSvc.confirmChangeEmail( 17133001, {
        query: {
          token: '87071649646742ee8dce48e4eb1dc0b0'
        }
      } )
    ).to.be.rejectedWith( Error, 'Already exist' );
  } );

  it( 'attempt to change email with a bad token in the query', async () => {
    await expect(
      usersSvc.confirmChangeEmail( 17133001, {
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

    await usersSvc.changePassword( 17133001, {
      password
    } );

    const result = await config.knex( config.schemas.user ).select().first().where( { uid: 17133001 } );

    expect( result.password ).to.be.equal( crypto.hashPassword( password, result.salt ) );
  } );

  it( 'change password - validation fail', async () => {
    const password = null;

    const error = await expect(
      usersSvc.changePassword( 17133001, {
        password
      } )
    ).to.be.rejected;

    expect( error.errors ).to.have.lengthOf( 1 );
    expect( error.errors[ 0 ] ).to.include( {
      field: 'password',
      code: 'required'
    } );
  } );

  it( 'try to change password of an inexistent user', async () => {
    const password = 'lab***adudule';

    const result = await usersSvc.changePassword( 78945612, {
      password
    } );

    expect( result ).to.be.equal( null );
  } );
} );

describe( 'generateApiKey', () => {
  it( 'generate new api public key', async () => {
    const user = await usersSvc.generateApiKey( 17133001, {
      publicKey: true,
      secretKey: true
    } );

    expect( user.apiSecret ).to;
  } );
} );

describe( 'remove', () => {
  it( 'remove a user', async () => {
    const user = await usersSvc.remove( 17133001, { detailed: true } );

    expect( user.isRemoved ).to.be.equal( true );

    const modifiedUser = await usersSvc.get( 17133001 );

    expect( modifiedUser ).to.be.null;

    const removedUser = await usersSvc.get( 17133001, { removed: null, detailed: true, internal: true } );

    expect( removedUser.email ).to.be.equal( null );
    expect( removedUser.store.email ).to.be.equal( 'vincentac@gmail.com' );
    expect( removedUser.isRemoved ).to.be.equal( true );
  } );
} );

describe( 'setNewFlag', () => {
  it( 'set a new flag to true', async () => {
    const user = await usersSvc.get( 17133001 );

    expect( user.isNew ).to.be.equal( true );

    const modifiedUser = await usersSvc.setNewFlag( 17133001, false );

    expect( modifiedUser.isNew ).to.be.equal( false );
  } );
} );

describe( 'refresh', () => {

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

  it( 'refresh lastSignin', async () => {
    const user = await usersSvc.refresh( 17133001, {
      lastSignin: true
    }, {
      detailed: true
    } );

    expect( user.lastSignin ).to.eql( now );
  } );

  it( 'refresh lastInboxCheck', async () => {
    const user = await usersSvc.refresh( 17133001, {
      lastInboxCheck: true
    }, {
      detailed: true
    } );

    expect( user.lastInboxCheck ).to.eql( now );
  } );

  it( 'refresh lastNotified', async () => {
    const user = await usersSvc.refresh( 17133001, {
      lastNotified: true
    }, {
      detailed: true
    } );

    expect( user.lastNotified ).to.eql( now );
  } );
} );

describe( 'verifyPassword', () => {
  it( 'check a good password', async () => {
    const validPassword = await usersSvc.verifyPassword( 'cibulon', {
      query: {
        email: 'gaetan@cibul.net'
      }
    } );

    expect( validPassword ).to.be.equal( true );
  } );
} );
