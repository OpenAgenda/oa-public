"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'keys - update', function () {

  this.timeout( 30000 );

  before( async () => {

    await service.initAndLoad( config );

  } );

  it( 'update a key by his id', async () => {

    const result = await service( 1 ).update( { label: 'The key of dead' } );

    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( {
      id: 1,
      type: 'userPublic',
      identifier: 98596585,
      label: 'The key of dead'
    } );

  } );

  it( 'update a label of key by key', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585, key: '2733c8183cca49dcbfbaefd6c957f5b6' } )
      .update( { label: 'Clé' } );

    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( {
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: 'Clé'
    } );

  } );

  it( 'update a key', async () => {

    try {

      const result = await service( { type: 'userPublic', identifier: 98596585 } )
        .update( { label: 'Clé' } );

    } catch ( e ) {

      e.name.should.equal( 'ValidationError' );

    }

  } );

} );

