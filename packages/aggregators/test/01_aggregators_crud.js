"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );

const fixtures = require( './fixtures/01' );
const service = require( '../' );

const config = require( '../config.test.js' );

describe( 'aggregators - functional ( server ): crud', function() {

  let knex;

  beforeAll( async () => {

    knex = knexLib( { 
      client: 'mysql', 
      connection: _.extend( {
        multipleStatements: true
      }, _.omit( config.mysql, [ 'database' ] ) )
    } );

    await knex.raw( fixtures.sql );

    service.init( { 
      knex,
      interfaces: {
        getObject: fixtures.getObject,
        getObjectItems: fixtures.getObjectItems
      }
    } );

  } );

  afterAll( () => {

    knex.destroy();

  } );

  test( 'get aggregator', async () => {

    const aggregator = await service( 1 );

    expect( aggregator.object ).toEqual( { id: 1 } );

  } );

  test( 'list aggregator sources', async () => {

    const aggregator = await service( 1 );

    const sources = await aggregator.sources.list();

    expect( sources ).toEqual( [ {
      object: { id: 2 }
    }, {
      object: { id: 3 }
    } ] );

  } );

  test( 'list aggregator sources deep', async () => {

    const aggregator = await service( 1 );

    const sources = await aggregator.sources.list( { deep: true } );

    expect( sources ).toEqual( [ { 
      object: { id: 2 }, 
      parent: { id: 1 }, 
      depth: 1 
    }, {
      object: { id: 4 }, 
      parent: { id: 2 }, 
      depth: 2
    }, { 
      object: { id: 6 }, 
      parent: { id: 4 }, 
      depth: 3
    }, {
      object: { id: 3 }, 
      parent: { id: 1 }, 
      depth: 1 
    }, {
      object: { id: 5 }, 
      parent: { id: 3 },
      depth: 2 
    } ] )

  } );

} );