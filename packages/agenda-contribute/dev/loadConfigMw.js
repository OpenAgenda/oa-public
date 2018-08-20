"use strict";

const _ = require( 'lodash' );

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  req.config = pickScenario( req ).config;

  next();

}
