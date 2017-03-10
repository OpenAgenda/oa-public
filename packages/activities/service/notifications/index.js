const _ = require( 'lodash' );
const list = require( './list' );
const get = require( './get' );
const update = require( './update' );
const remove = require( './remove' );

let config;
let knex;

module.exports = Object.assign( notifications, { init } );

function init( { config: c, knex: k } ) {

  config = c;
  knex = k;

  list.init( { config, knex } );
  get.init( { config, knex } );
  update.init( { config, knex } );
  remove.init( { config, knex } );

}

function notifications( entityType, entityUid ) {

  return _.mapValues( {
    list,
    get,
    update,
    remove
  }, fn => fn.bind( null, entityType, entityUid ) );

}

