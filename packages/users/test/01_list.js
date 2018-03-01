"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' );
const should = require( 'should' );
const fixtures = require( '@openagenda/fixtures' );
const service = require( './service' );


describe( '.list', function () {

  this.timeout( 20000 );

  before( async () => {

    await service.initAndLoad( config );
    await require( '@openagenda/keys' ).init( config );

  } );

  before( done => {

    fixtures.init( config );

    fixtures( [ {
      table: config.schemas.key,
      src: __dirname + '/fixtures/key.data.sql'
    } ], { reset: false }, done );

  } );

  it( 'list', async () => {

    const { users } = await service.list( 0, 10 );
    const { users: offsetUsers } = await service.list( 4, 1 );

    users.length.should.equal( 10 );
    offsetUsers.length.should.equal( 1 );
    users[ 4 ].id.should.equal( offsetUsers[ 0 ].id );

  } );

  it( 'list with cb', done => {

    service.list( 0, 10, { detailed: true, total: true }, ( err, users, total ) => {

      should( err ).equal( null );
      users.length.should.equal( 10 );
      total.should.equal( 25 );

      done();

    } );

  } );

  it( 'list with search query', async () => {

    const { users } = await service.list( { search: 'latouche' } );

    users.length.should.equal( 1 );

  } );

  it( 'list with uid query', async () => {

    const { users } = await service.list( { uid: [ 54505079, 27639980 ] } );

    users.length.should.equal( 2 );
    users.map( v => v.uid ).should.eql( [ 54505079, 27639980 ] );

  } );

  it( 'list with total option', async () => {

    const { users, total } = await service.list( 0, 10, { total: true } );

    users.length.should.equal( 10 );
    total.should.equal( 25 );

  } );

  it( 'list with detailed option', async () => {

    const { users } = await service.list( { search: 'latouche' }, { detailed: true } );

    users[ 0 ].isActivated.should.eql( 1 );
    users[ 0 ].isRemoved.should.eql( 0 );

  } );

  it( 'list with removed option', async () => {

    const { users } = await service.list( {}, { removed: true } );

    users.length.should.equal( 1 );

  } );

  it( 'list with removed option at null', async () => {

    const { users, total } = await service.list( {}, { removed: null, total: true } );

    users.length.should.equal( 20 );
    total.should.equal( 26 );

  } );

} );
