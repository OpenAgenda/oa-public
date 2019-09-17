"use strict";

const _ = require( 'lodash' );
const knex = require( 'knex' );

const logger = require( '@openagenda/logs' );
const storeLib = require( '@openagenda/mysql-table-store' );

const FormSchema = require( '../iso/FormSchema' );
const merge = require( '../iso/merge' );
const legacy = require( './legacy' );
const filesMw = require( './middleware/files' );

let client, log, config;

module.exports = {
  init,
  get,
  getMerged,
  getValidator,
  create,
  update,
  remove,
  legacy,
  shutdown,
  utils: {
    merge
  }
}


async function getMerged( ids, options = {} ) {

  const { instanciate } = _.assign( {
    instanciate: false,
  }, options );

  const schemas = [];

  for ( const id of [].concat( ids ) ) {

    schemas.push( await get( id ) );

  }

  const merged = merge.apply( null, schemas );

  if ( instanciate ) return new FormSchema( merged );

  return merged;

}

async function get( id, options = {} ) {

  if ( !client ) {

    throw new Error( 'db client not initialized' );

  }

  let store = await client( config.schemas.formSchema )

    .where( { id } )

    .then( rows => rows.length ? rows[ 0 ].store : null );

  if ( store === null ) return null;

  let parsed = JSON.parse( store );

  parsed.id = id;

  if ( options.instanciate ) {

    return new FormSchema( _.assign( parsed, { id } ) );

  }

  return parsed;

}

async function getValidator( id, options = {} ) {

  let data = await get( id );

  if ( data === null ) {

    return null;

  }

  let fs = new FormSchema( data );

  return fs.getValidate( options );

}


async function create( data ) {

  let clean;

  try {

    clean = FormSchema.validate( data );

  } catch ( errors ) {

    log( 'failed creating form-schema', JSON.stringify( data ) );

    return {
      success: false,
      errors
    }

  }

  let id = await client( config.schemas.formSchema )

    .insert( {
      store: JSON.stringify( clean )
    } )

    .then( ids => ids[ 0 ] );

  log( 'created form-schema %s', id );

  return {
    success: true,
    id,
    formSchema: clean
  }

}

async function update( id, data ) {

  let clean;

  try {

    clean = FormSchema.validate( data );

  } catch ( errors ) {

    log( 'failed updating form-schema %s', id, JSON.stringify( data ) );

    return {
      id,
      success: false,
      errors
    }

  }

  let updatedId = await client( config.schemas.formSchema )

    .update( {
      store: JSON.stringify( clean )
    } )

    .where( { id } );

  log( 'updated form-schema %s', id );

  return {
    id,
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

    logger.setModuleConfig( c.logger );

  }

  log = logger( 'index' );

  log( 'initializing' );

  client = c.knex || knex( {
    client: 'mysql',
    connection: c.mysql
  } );

  legacy.init( c, {
    create,
    update,
    get
  } );

  filesMw.init( _.pick( config, [
    'tmpFolder',
    's3'
  ] ) );

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
