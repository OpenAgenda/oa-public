"use strict";

const config = require( '../config' );

module.exports = async ( scrollId, scroll ) => {

  const res = await config.client.scroll( { scrollId, scroll } );

  return {
    events: res.hits.hits.map( h => h[ '_source' ] ),
    total: res.hits.total
  }

}