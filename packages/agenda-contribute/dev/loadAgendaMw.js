"use strict";

const _ = require( 'lodash' );
const pickScenario = require( './pickScenario' );

// middleware to be given to service so session can be loaded
// 
module.exports = ( req, res, next ) => {

  console.log( 'loadAgendaMw', req.baseUrl );

  const agendaSlug = req.baseUrl.split( '/' )[ 1 ];

  const scenario = pickScenario( agendaSlug );

  req.agenda = scenario.agenda

  next();

}