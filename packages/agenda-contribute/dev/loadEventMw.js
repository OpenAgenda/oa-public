"use strict";

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  const scenario = pickScenario( req );

  req.event = scenario.event;

  next();

}