"use strict";

const sources = require( './sources' );

module.exports = {
  sources,
  init: c => {

    sources.init( c );

  }
}