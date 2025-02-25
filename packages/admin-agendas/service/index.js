"use strict";

const knexLib = require( 'knex' );
const w = require( 'when' );
const logs = require( '@openagenda/logs' );
const mw = require( './middleware' );

let membersSvc;
let config;
let knex;

module.exports = {
  init,
  mw,
  members: {
    list: (...args) => membersSvc.list( ...args )
  }
};

function init( c, cb ) {

  config = c;

  w( c )

  .then( () => {

    membersSvc = c.services.members;

    if ( c.logger ) {

      logs.setModuleConfig( c.logger );

    }

  } )

  .then( () => {

    knex = knexLib( {
      client: 'mysql',
      connection: c.mysql
    } );

  } )

  .then( () => {

    mw.init( require( './' ), c );

  } )

  .done( () => {

    if ( cb ) {
      cb();
    }

  } );

}
