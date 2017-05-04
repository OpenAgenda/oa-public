"use strict";

const agendaCategories = require( 'agenda-categories' );

const appServiceAgendas = require( './agenda' ),

  logger = require( 'logger' );

module.exports.init = ( config, cb ) => {

  agendaCategories.init( {
    store: config.db,
    legacy: config.db,
    logger,
    interfaces: appServiceAgendas.tagsAndCategories
  }, cb );

}