"use strict";

const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'keys - remove', function () {

  this.timeout( 30000 );

  before( async () => {

    await service.initAndLoad( config );

  } );

  it( 'remove a key by his id', async () => {

    const result = await service( 1 ).remove();

    result.should.equal( 1 );

  } );

  it( 'remove a key', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585, key: '2733c8183cca49dcbfbaefd6c957f5b6' } )
      .remove();

    result.should.equal( 1 );

  } );

} );

