"use strict";

const parserOpts = require( './parser-opts' );
const writerOpts = require( './writer-opts' );


module.exports = Promise.resolve( {
  parserOpts,
  writerOpts
} );
