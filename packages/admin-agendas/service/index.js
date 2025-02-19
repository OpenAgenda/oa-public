import knexLib from 'knex';
import w from 'when';
import logs from '@openagenda/logs';
import mw from './middleware.js';

let membersSvc;
let config;
let knex;

const service = {
  init,
  mw,
  members: {
    list: (...args) => membersSvc.list(...args),
  },
};

export default service;

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

    mw.init( service, c );

  } )

  .done( () => {

    if ( cb ) {
      cb();
    }

  } );

}
