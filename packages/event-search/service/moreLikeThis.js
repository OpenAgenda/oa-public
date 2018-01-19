"use strict";

const config = require( './config' );
const parseQuery = require( './query' );

module.exports = async ( alias, query, mltFields = [] ) => {

  const filterPartDsl = parseQuery( 
    query, 
    {} /*nav*/, 
    [] /*extensions*/, 
    // includes
    config.baseSearchIncludes
  );

  console.log( filterPartDsl );

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