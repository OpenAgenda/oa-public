"use strict";

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  console.log( 'loading schema extensions' );

  const scenario = pickScenario( req );

  req.schemaExtensions = scenario.schemaExtensions;

  next();

}
