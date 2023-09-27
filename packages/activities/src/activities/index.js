"use strict";

const _ = require( 'lodash' );
const add = require( './add' );
const list = require( './list' );
const get = require( './get' );
const anonymize = require( './anonymize' );

module.exports = function activities( config, identifiers ) {

  return _.mapValues( {
    add,
    list,
    get,
    anonymize
  }, fn => fn.bind( null, config, identifiers ) );

}
