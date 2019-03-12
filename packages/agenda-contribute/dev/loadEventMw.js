"use strict";

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  const scenario = pickScenario( req );

  console.log( 'loading event %s', req.params.eventUid );

  if ( scenario.event ) {

    req.event = scenario.event;

  }

  next();

}
