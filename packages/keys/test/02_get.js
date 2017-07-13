"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'keys - get', function () {

  this.timeout( 30000 );

  before( async () => {

    await service.initAndLoad( config );

  } );

  it( 'get a key by his id', async () => {

    const result = await service( 1 ).get();

    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( {
      id: 1,
      type: 'userPublic',
      identifier: 98596585,
      label: 'Vielle clé !'
    } );

  } );

  it( 'get a key', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585, key: '2733c8183cca49dcbfbaefd6c957f5b6' } )
      .get();

    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( {
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: null
    } );

  } );

} );

