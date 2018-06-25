"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'keys - list', function () {

  this.timeout( 30000 );

  before( async () => {

    await service.initAndLoad( config );

  } );

  it( 'simple list', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585 } ).list();

    result.items.map( v => _.omit( v, 'key', 'createdAt' ) ).should.eql( [
      {
        id: 1,
        type: 'userPublic',
        identifier: 98596585,
        label: 'Vielle clé !'
      },
      {
        id: 2,
        type: 'userPublic',
        identifier: 98596585,
        label: null
      }
    ] );

  } );

  it( 'list an offset and a limit', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585 } ).list( 1, 1 );

    result.items.map( v => _.omit( v, 'key', 'createdAt' ) ).should.eql( [
      {
        id: 2,
        type: 'userPublic',
        identifier: 98596585,
        label: null
      }
    ] );

  } );

  it( 'list gives total', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585 } ).list( { total: true } );

    result.total.should.equal( 2 );
    result.items.map( v => _.omit( v, 'key', 'createdAt' ) ).should.eql( [
      {
        id: 1,
        type: 'userPublic',
        identifier: 98596585,
        label: 'Vielle clé !'
      },
      {
        id: 2,
        type: 'userPublic',
        identifier: 98596585,
        label: null
      }
    ] );

  } );

  it( 'empty list', async () => {

    const result = await service( { type: 'userPublic', identifier: 98597885 } ).list();

    result.items.length.should.equal( 0 );

  } );

} );

