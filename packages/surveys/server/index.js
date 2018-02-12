"use strict";

const app = require( 'express' )();
const bodyParser = require( 'body-parser' );
const ih = require( 'immutability-helper' );

let knex = null; // knex connection given to service
let schema = null;

module.exports = {
  app,
  init,
  create
}

async function init( c ) {

  knex = c.knex;
  schema = c.schema;

  const exists = await knex.schema.hasTable( c.schema );

  if ( !exists ) {

    await knex.schema.createTable( schema, table => {
      table.increments();
      table.json( 'store' );
      table.timestamps();
    } );

  }

  // create db & table if doesn't exist

}

async function create( data ) {

  const createdAt = new Date;
  const updatedAt = new Date;

  const [ insertId ] = await knex( schema ).insert( {
    store: JSON.stringify( data ),
    created_at: createdAt,
    updated_at: updatedAt
  } );

  return ih( data, { 
    id: { $set: insertId },
    createdAt,
    updatedAt
  } );

}

app.post( '/', bodyParser.json(), async ( req, res, next ) => {

  console.log( 'this was posted', req.body );

  await create( req.body );

  res.json( 200 );

} );
