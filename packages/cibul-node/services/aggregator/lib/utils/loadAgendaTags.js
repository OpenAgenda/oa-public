"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const log = require( '@openagenda/logs' )( 'services/aggregator/utils/loadAgendaTags' );

const agendaTagsGet = promisify( require( '@openagenda/agenda-tags' ).get );

/**
 * Gets concatenated list of tags
 * During evaluate, label is used for match, an entry is used by legacy func 'assignTag'
 *
 * [ { id: 51339, label: 'T1', slug: 't1' },
 *   { id: 51340, label: 'T2', slug: 't2' },
 *   { id: 51341, label: 'T3', slug: 't3' },
 *   { id: 51342, label: 'T4', slug: 't4' } ]
**/
module.exports = async agendaId => {

  const set = await agendaTagsGet( agendaId );

  if ( !set ) {

    log( 'there are no tags associated with agenda %s', agendaId );

    return [];

  }

  const tags = set.groups.reduce( ( tags, group ) => tags.concat( group.tags ), [] );

  log( 'loaded %s tags for agendaId %s', tags.length, agendaId );

  return tags;

}
