"use strict";

const { promisify } = require( 'util' );
const agendaCategories = require( '@openagenda/agenda-categories' );
const logger = require( '@openagenda/logger' );
const appServiceAgendas = require( './agenda' );

module.exports.init = async config => {

  function _query( queryStr, values, cb ) {

    const query = config.knex.raw( queryStr, values );

    query
      .then(
        result => result[ 0 ],
        err => {

          process.nextTick( () => cb( err ) );

        }
      )
      .then( rows => {

        process.nextTick( () => cb( null, rows ) );

      } );

  }

  await promisify( agendaCategories.init )( {
    store: {
      query: _query
    },
    legacy: {
      query: _query
    },
    logger,
    interfaces: appServiceAgendas.tagsAndCategories
  } );

}
