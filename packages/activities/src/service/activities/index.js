"use strict";

const _ = require( 'lodash' );
const add = require( './add' );
const list = require( './list' );
const get = require( './get' );

module.exports = function activities( config, identifiers ) {

  return _.mapValues( {
    add,
    list,
    get
  }, fn => fn.bind( null, config, identifiers ) );

}
