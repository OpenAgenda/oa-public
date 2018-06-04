"use strict";

const _ = require( 'lodash' );
const config = require( '../config' );

module.exports = async ( alias, dsl, options = {} ) => {
  
  const search = {
    type: config.type,
    index: alias,
    body: dsl
  };

  [ 'scroll' ].forEach( f => {

    search[ f ] = options[ f ];

  } );

  const res = await config.client.search( search );

  return _.extend( {
    events: res.hits.hits.map( h => h[ '_source' ] ),
    total: res.hits.total,
    scrollId: res[ '_scroll_id' ],
    searchAfter: dsl.sort && res.hits.hits.length ? res.hits.hits[ res.hits.hits.length - 1 ].sort : null
  }, dsl.aggregations ? {
    aggregations: res.aggregations
  } : {} )

}