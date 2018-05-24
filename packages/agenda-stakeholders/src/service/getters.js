"use strict";

const w = require( 'when' ),

  utils = require( '@openagenda/utils' ),

  logger = require( '@openagenda/logs' ),

  dbUtils = require( './dbUtils' ),

  format = require( './format' ),

  list = require( './list' ),

  get = require( './get' );


let knex, schemas, interfaces, log;

module.exports = agenda;

module.exports.init = init;

module.exports.user = user;


function agenda( agendaId ) {

  return {
    get: get.bind( null, { agendaId } ),
    list: list.bind( null , { agendaId } )
  }

}


function user( userId ) {

  return {
    list: list.bind( null, { userId } )
  }

}


function init( config ) {

  log = logger( 'getters' );

  log( 'initing' );

  list.init( config );

  get.init( config );

}