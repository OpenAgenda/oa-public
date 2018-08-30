"use strict";

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  console.log( 'loading config' );

  req.config = pickScenario( req ).config;

  next();

}
