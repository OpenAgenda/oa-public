"use strict";

const _ = require( 'lodash' );

const pickScenario = require( './pickScenario' );

module.exports = ( req, res, next ) => {

  _.extend( req.config, pickScenario( req ).config );

  next();

}
