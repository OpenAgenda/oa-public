"use strict";

// simple dev db
const fixtures = require( './fixtures.json' );

// dev interface functions
const interfaces = require( './interfaces' )( fixtures );

module.exports = {
  interfaces
}
