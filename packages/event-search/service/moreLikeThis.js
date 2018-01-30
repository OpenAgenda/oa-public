"use strict";

const _ = require( 'lodash' );
const config = require( './config' );
const getMoreLikeThisDsl = require( './query' ).moreLikeThis;
const runDslQuery = require( './search/dsl' );

module.exports = async ( alias, mltQuery, query ) => {

  if ( _.keys( mltQuery ).length === 0 ) return { events: [], total: 0 };

  const dsl = getMoreLikeThisDsl( mltQuery, query );

  const { events, total } = await runDslQuery( alias, dsl );

  return {
    events,
    total
  };

}