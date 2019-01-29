"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'search/resyncUpdated' );

const bulk = require( './lib/bulk' );

module.exports = async ( { obj, config, getClient }, since = null ) => {

  let updated = 0;
  let indexed = 0;

  const client = getClient( config.elasticsearch );

  const bulkConfig = {
    client,
    index: obj.alias,
    obj,
    image: config.image
  }

  const updatedAtGreaterThan = _clean( since );

  log( 'info', 'launching update from %s', updatedAtGreaterThan );

  const { interfaces } = config;

  const agendas = await interfaces.list( { updatedAtGreaterThan }, 0, 20, { detailed: true } );

  log( 'info', '%s agendas to update since %s', agendas.length, updatedAtGreaterThan );

  if ( !agendas.length ) return { updated, indexed };

  const existing = await client.mget( {
    index: obj.alias,
    type: obj.type,
    body: {
      ids: agendas.map( a => a.uid )
    }
  } );

  const uids = _.get( existing, 'docs', [] )
    .filter( item => item.found )
    .map( item => parseInt( item._id ) );

  const {
    toUpdate,
    toIndex
  } = agendas.reduce( ( split, agenda ) => {

    split[ uids.includes( agenda.uid ) ? 'toUpdate' : 'toIndex' ].push( agenda );

    return split;

  }, { toUpdate: [], toIndex: [] } );

  if ( toUpdate.length ) {

    updated = await bulk( _.assign( { operation: 'update' }, bulkConfig ), toUpdate );

    log( 'info', 'bulk updated %s agendas', updated );

  }

  if ( toIndex.length ) {

    indexed = await bulk( _.assign( { operation: 'index' }, bulkConfig ), toIndex );

    log( 'info', 'bulk indexed %s agendas', indexed );

  }

  return {
    indexed,
    updated
  }

}


function _clean( since ) {

  if ( since ) return since;

  const anHourAgo = new Date();

  anHourAgo.setHours( anHourAgo.getHours() -1 );

  return anHourAgo;

}
