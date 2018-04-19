"use strict";

module.exports = require( './server/templater' );

module.exports.helpers = {
  time: require( './helpers/time' ),
  text: require( './helpers/text' )
}