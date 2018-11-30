"use strict";

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  const scenario = pickScenario( req );

  if ( !scenario.delay || req.method === 'GET' ) return next();

  setTimeout( () => next(), scenario.delay );

}
