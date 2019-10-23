"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const log = require( '@openagenda/logs' )( 'aggregator/utils/loadAgendaCategories' );

const agendaCategoriesGet = promisify( require( '@openagenda/agenda-categories' ).get );


/**
 * returns categories associated with agenda
 *
 * looks like this
 * [ { id: 7299, label: 'C1', slug: 'c1' },
 *   { id: 7300, label: 'C2', slug: 'c2' } ]
 */
module.exports = async agendaId => {

  const set = await agendaCategoriesGet( agendaId );

  if ( !set ) {

    log( 'there are no categories associated with agenda %s', agendaId );

    return [];

  }

  log( 'loaded %s categories for agendaId %s', set.categories.length, agendaId );

  return set.categories;

}
