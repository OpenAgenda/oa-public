"use strict";

const knexLib = require( 'knex' ),

  legacy = require( './legacy' ),

  list = require( './list' ),

  set = require( './set' ),

  get = require( './get' ),

  details = require( './details' ),

  remove = require( './remove' ),

  logger = require( 'basic-logger' ),

  validate = require( './validate' ),

  Agenda = require( './Agenda' ),

  imageFiles = require( 'image-files' ),

  slugs = require( './slugs' ),

  middleware = require( '../middleware' ),

  service = {
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
    getConfig: () => config
  };

module.exports = service;

let knex, config, schemas, imagePath, log;

function init( c ) {

  schemas = c.schemas;

  config = c;

  knex = knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

  if ( c.logger ) {

    logger.setLogger( c.logger );

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

  imageFiles.init( {
    files: c.files,
    logger: c.logger
  } );

  middleware.init( c, service );

  Object.keys( service.tasks ).forEach( k => {

    service.tasks[ k ].init( service );

  } );

  log = logger( 'agendas service' );

}


function count( cb ) {

  list( {}, null, null, { total: true }, ( err, agendas, total ) => {

    if ( err ) cb( err );

    cb( null, total );

  } );

}