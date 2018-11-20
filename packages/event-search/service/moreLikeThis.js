"use strict";

const log = require( '@openagenda/logs' )( 'morelikeThis' );

const _ = require( 'lodash' );
const config = require( './config' );
const getMoreLikeThisDsl = require( './query' ).moreLikeThis;
const runDslQuery = require( './search/dsl' );

module.exports = async ( alias, mltQuery, mltOptions, query ) => {

  log( 'compiling more like this query from %j mlt query, %j mlt options and %j query', mltQuery, mltOptions || 'no', query || 'no' );

  if ( _.keys( mltQuery ).length === 0 ) return { events: [], total: 0 };

  const dsl = getMoreLikeThisDsl( mltQuery, mltOptions, query );

  //https://d.openagenda.com/agendas/91912620/events/suggestions?sample%5Btitle%5D%5Bfr%5D=Horreur
  //console.log( JSON.stringify( dsl, null, 2 ) );

  const { events, total } = await runDslQuery( alias, dsl );

  return { events, total };

}
