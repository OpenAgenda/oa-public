"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'keys - create', function () {

  this.timeout( 30000 );

  before( async () => {

    await service.initAndLoad( config );

  } );

  it( 'create an user key', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585 } )
      .create( { label: 'Ma première clé #ému' } );

    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( {
      id: 3,
      type: 'userPublic',
      identifier: 98596585,
      label: 'Ma première clé #ému'
    } );

  } );

  it( 'create an user key without label', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585 } ).create();

    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( {
      id: 4,
      type: 'userPublic',
      identifier: 98596585,
      label: null
    } );

  } );

} );

