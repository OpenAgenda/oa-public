"use strict";

const _ = require( 'lodash' );

module.exports = ( sort = null ) => {

  if ( sort ) {

    const [ field, order ] = sort.split( '.' );

    return [ _.set( {}, field + '.order', order ) ];

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
    search_internals_last_timing: { order: 'desc' }
  } ];

}