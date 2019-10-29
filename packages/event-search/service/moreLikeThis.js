"use strict";

const log = require( '@openagenda/logs' )( 'morelikeThis' );

const _ = require( 'lodash' );
const config = require( './config' );
const getMoreLikeThisDsl = require( './query' ).moreLikeThis;
const runDSLQuery = require('./helpers/runDSLQuery');

module.exports = async ( alias, mltQuery, mltOptions, query ) => {

  log( 'compiling more like this query from %j mlt query, %j mlt options and %j query', mltQuery, mltOptions || 'no', query || 'no' );

  if ( _.keys( mltQuery ).length === 0 ) return { events: [], total: 0 };

  const dsl = getMoreLikeThisDsl( mltQuery, mltOptions, query );

  const { events, total } = await runDSLQuery(_.pick(config, ['client', 'type']), alias, dsl );

  return { events, total };

}
