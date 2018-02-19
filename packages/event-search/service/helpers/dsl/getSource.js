"use strict";

module.exports = ( includes = null ) => {

  const source = {
    excludes: [ 
      'search_internals_*', 
      'timings.search_internals_*'
    ]
  };

  if ( includes === null ) return source;

  source.includes = includes;

  return source;

}