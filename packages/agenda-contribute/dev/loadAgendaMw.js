"use strict";

const _ = require( 'lodash' );
const pickScenario = require( './pickScenario' );

// middleware to be given to service so session can be loaded
// 
module.exports = ( req, res, next ) => {

  console.log( 'loading agenda' );

  req.agenda = pickScenario( req ).agenda;

  next();

}
