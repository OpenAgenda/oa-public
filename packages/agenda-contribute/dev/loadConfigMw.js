"use strict";

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  const sc = pickScenario( req );

  req.config = sc.config;

  next();

}