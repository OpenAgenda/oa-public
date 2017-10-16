"use strict";

const get = require( './get' );

module.exports = {
  get,
  init: c => {

    get.init( c );

  }
}