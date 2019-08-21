"use strict";

module.exports = ( prefix, key ) => ( {
  debug: {
    prefix: prefix + ':' + key + ':'
  },
  token: null
} );
