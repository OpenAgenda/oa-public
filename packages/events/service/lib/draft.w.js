"use strict";

const eventUtils = require( '../../utils' );

module.exports = target => v => {

  v[ target ].draft = v.draft !== null ? v.draft : !eventUtils.isComplete( v[ target ] );

  return v;

}