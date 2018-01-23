"use strict";

const config = require( './config' );
const getMoreLikeThisDsl = require( './query' ).moreLikeThis;
const runDslQuery = require( './search/dsl' );

module.exports = async ( alias, mltQuery, query ) => {

  const dsl = getMoreLikeThisDsl( mltQuery, query );

  const { events, total } = await runDslQuery( alias, dsl );

  return {
    events,
    total
  };

  /*
  
  { sort: 
   [ { 'timings.end': [Object] },
     { search_internals_last_timing: [Object] } ],
  _source: 
   { excludes: [ 'search_internals_*', 'timings.search_internals_*' ],
     includes: 
      [ 'uid',
        'title',
        'dateRange',
        'image',
        'keywords',
        'slug',
        'agenda.uid',
        'agenda.title',
        'agenda.image',
        'timings',
        'location.name',
        'location.address',
        'contributor.organization',
        'timezone' ] },
  query: { term: { uid: 2 } } }

  
   */

}