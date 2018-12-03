"use strict";

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  const scenario = pickScenario( req );

  if ( !scenario.globalError || req.method === 'GET' ) return next();

  return res.status( 400 ).send();

}
