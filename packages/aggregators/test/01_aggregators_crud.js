"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );

const fixtures = require( './fixtures/01' );
const service = require( '../' );

const config = require( '../config.test.js' );

describe( 'aggregators - functional ( server ): crud', function() {

  let knex;

  before( async () => {

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

  after( () => {

    knex.destroy();

  } );

  it( 'get aggregator', async () => {

    const aggregator = await service( 1 );

    aggregator.object.should.eql( { id: 1 } );

  } );

  it( 'list aggregator sources', async () => {

    const aggregator = await service( 1 );

    const sources = await aggregator.sources.list();

    sources.should.eql( [ {
      object: { id: 2 }
    }, {
      object: { id: 3 }
    } ] );

  } );

  it( 'list aggregator sources deep', async () => {

    const aggregator = await service( 1 );

    const sources = await aggregator.sources.list( { deep: true } );

    sources.should.eql( [ {
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
