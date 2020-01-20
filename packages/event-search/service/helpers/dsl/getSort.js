"use strict";

const _ = require( 'lodash' );

module.exports = ( sorts = null ) => {

  sorts = [].concat( sorts );

  if ( sorts.length ) {

    return sorts.map( sort => {

      const split = sort.split( '.' );

      const order = split.pop();

      const field = split.join( '.' );

      const dslOrderItem = {};

      dslOrderItem[ field ] = { 'order': order };

      return dslOrderItem;

    } );

  }

  return [ {
    'timings.end' : {
      mode: 'min',
      order: 'asc',
      nested_path: 'timings',
      nested_filter: {
        range: { 'timings.end' : { gte: 'now' } }
      }
    }
  }, {
    _search_last_timing: { order: 'desc' }
  } ];

}
