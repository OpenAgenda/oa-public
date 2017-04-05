const _ = require( 'lodash' );
const list = require( './list' );
const get = require( './get' );
const update = require( './update' );
const remove = require( './remove' );

let config;
let knex;
let service;

module.exports = Object.assign( notifications, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  list.init( { config, knex, service } );
  get.init( { config, knex, service } );
  update.init( { config, knex, service } );
  remove.init( { config, knex, service } );

}

function notifications( identifiers ) {

  return _.mapValues( {
    list,
    get,
    update,
    remove
  }, fn => fn.bind( null, identifiers ) );

}

