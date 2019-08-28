"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );

const logger = require( '@openagenda/logs' );

const Agenda = require( './Agenda' );
const details = require( './details' );
const get = require( './get' );
const legacy = require( './legacy' );
const list = require( './list' );
const middleware = require( '../middleware' );
const remove = require( './remove' );
const set = require( './set' );
const slugs = require( './slugs' );
const validate = require( './validate' );

const service = {
  init,
  list,
  get,
  findOne: get.findOne,
  Agenda,
  instanciate: data => new Agenda( data ),
  middleware,
  set,
  remove,
  count,
  slugs: {
    isTaken: slugs.isTaken,
    generate: slugs.generate,
  },
  tasks: {
    loadFromLegacy: require( '../tasks/loadFromLegacy' )
  },
  getConfig: () => config,
  contributionTypes: require( './validate/contributionTypes' )
};

const log = logger( 'index' );

module.exports = service;

let knex, config, schemas, imagePath;

function init( c ) {

  schemas = c.schemas;

  config = c;

  knex = _.get( c, 'knex' ) || knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

  if ( c.logger ) {

    logger.setModuleConfig( c.logger );

  }

  imagePath = service.getConfig().imagePath;

  details.init( schemas, knex );

  get.init( service, knex );

  set.init( service, knex );

  remove.init( service, knex );

  list.init( service, knex );

  Agenda.init( service );

  slugs.init( schemas, knex );

  legacy.init( schemas, knex );

  middleware.init( c, service );

  Object.keys( service.tasks ).forEach( k => {

    service.tasks[ k ].init( service );

  } );

}


function count( cb ) {

  list( {}, null, null, { total: true }, ( err, agendas, total ) => {

    if ( err ) cb( err );

    cb( null, total );

  } );

}
