"use strict";

const sources = require( './lib/sources' );
const config = require( './lib/config' );

module.exports = {
  sources,
  init: config.init
}