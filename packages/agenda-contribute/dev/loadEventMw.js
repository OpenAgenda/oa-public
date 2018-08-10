"use strict";

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  const scenario = pickScenario( req );

  console.log( 'loading event %s', req.params.eventUid );

  req.event = scenario.event;

  next();

}
