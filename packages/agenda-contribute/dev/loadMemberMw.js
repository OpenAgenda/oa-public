"use strict";

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  const scenario = pickScenario( req );

  req.member = scenario.member;

  next();

}