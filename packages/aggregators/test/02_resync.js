"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );

const fixtures = require( './fixtures/01' );
const service = require( '../' );

const config = require( '../config.test.js' );

describe( 'aggregators - functional ( server ): resync', function() {

  let knex;

  before( async () => {

    knex = knexLib( {
      client: 'mysql',
      connection: _.extend( {
        multipleStatements: true
      }, _.omit( config.mysql, [ 'database' ] ) )
    } );

    await knex.raw( fixtures.sql );

  } );

  after( () => {

    knex.destroy();

  } );

  it( 'resync', async () => {

    const totalItems = _.keys( fixtures.references ).reduce( ( items, key ) => items.concat( fixtures.references[ key ] ), [] );

    let evaluatedCount = 0;

    service.init( {
      knex,
      interfaces: {
        getObject: fixtures.getObject,
        getObjectItems: fixtures.getObjectItems,
        evaluateObjectItem: async ( aggregatorObject, object, item ) => {

          evaluatedCount++;

        }
      }
    } );

    await service.resync( { id: 1 } );

    evaluatedCount.should.equal( totalItems.length );

  } );

} );
