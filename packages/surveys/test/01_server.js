"use strict";

const config = require( '../config.dev.js' );

const service = require( '../server' );

beforeAll( async () => {

  await config.knex.raw( 'drop database if exists ' + config.test.connection.database );
  await config.knex.raw( 'create database ' + config.test.connection.database );
  await config.knex.raw( 'use ' + config.test.connection.database );

  await service.init( config );

} );

test( 'create creates', async () => {

  await service.create( {
    data: 1
  } );

  const [ rows ] = await config.knex.raw( 'select * from ' + config.schema );

  expect( rows.length ).toBe( 1 );

  expect( rows[ 0 ].store ).toBe( '{"data":1}' );

} );
