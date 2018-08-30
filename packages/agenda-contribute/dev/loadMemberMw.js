"use strict";

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  console.log( 'loading member' );

  const scenario = pickScenario( req );

  req.member = scenario.member;

  next();

}
