"use strict";

const storeLib = require( 'mysql-table-store' ),

  FormSchema = require( './iso/FormSchema' ),

  _ = require( 'lodash' ),

  legacy = require( './legacy' ),

  logger = require( 'basic-logger' ),

  knex = require( 'knex' );

let client, log, config;

module.exports = {
  init,
  get,
  getValidator,
  create,
  update,
  remove,
  legacy,
  shutdown
}

async function get( id ) {

  if ( !client ) {

    throw new Error( 'db client not initialized' );

  }

  let store = await client( config.schemas.formSchema )

    .where( { id } )

    .then( rows => rows.length ? rows[ 0 ].store : null );

  return JSON.parse( store );

}

async function getValidator( id ) {

  let data = await get( id );

  if ( data === null ) {

    return null;

  }

  let fs = new FormSchema( data );

  return fs.getValidate();

}


async function create( data ) {

  let clean;

  log( 'creating form-schema' );

  try {

    clean = FormSchema.validate( data );

  } catch ( errors ) {

    return {
      success: false,
      errors
    }

  }

  let id = await client( config.schemas.formSchema )

    .insert( {
      store: JSON.stringify( clean )
    } )

    .then( ids => ids[ 0 ] );

  return {
    success: true,
    id,
    formSchema: clean
  }

}

async function update( id, data ) {

  let clean;

  log( 'creating form-schema' );

  try {

    clean = FormSchema.validate( data );

  } catch ( errors ) {

    return {
      success: false,
      errors
    }

  }

  let updatedId = await client( config.schemas.formSchema )

    .update( {
      store: JSON.stringify( clean )
    } )

    .where( { id } );

  return {
    success: updatedId === id,
    formSchema: clean
  }

}


async function remove( id ) {

  let removedId = await client( config.schemas.formSchema )

    .delete( { id } );

  return {
    success: true,
    id: removedId
  }

}

function init( c ) {

  config = c;

  if ( c.logger ) {

    logger.setLogger( c.logger );

  }

  log = logger( 'form-schema' );

  client = knex( {
    client: 'mysql',
    connection: c.mysql
  } );

  legacy.init( c, {
    create,
    update,
    get
  } );

}

function shutdown( cb ) {

  client.destroy();

  legacy.shutdown( cb );

}


function _cleanArguments( id, data, options ) {

  // id, data
  if ( !options && typeof id !== 'object' ) {

    return {
      id,
      data,
      options: {}
    }

  // data, options
  } else if ( !options ) {

    return {
      id: null,
      data: id,
      options: data
    }

  }

  return { id, data, options };

}