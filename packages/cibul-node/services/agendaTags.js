"use strict";

const agendaTags = require( 'agenda-tags' );

const appServiceAgendas = require( './agenda' ),

  logger = require( 'logger' );

module.exports.init = ( config, cb ) => {

  agendaTags.init( {
    store: config.db,
    legacy: config.db,
    logger,
    interfaces: appServiceAgendas.tagsAndCategories
  }, cb );

}