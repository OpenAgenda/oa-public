"use strict";

var logger = require( 'basic-logger' ), log,

  validators = require( 'validators' ),

  React = require( 'react' ),

  ReactDOMServer = require( 'react-dom/server' ),

  Body = React.createFactory( require( '../components/lib/Body' ) ),

  service, config,

  utils = require( 'utils' );


module.exports = {
  init,
  getMe,
  updateProfile,
  changeEmail,
  changePassword
};


function init( s, c ) {

  service = s;

  config = utils.extend( {
    limit: {
      default: 20,
      max: 100
    }
  }, c.mw || {} );

}

function getMe( req, res, next ) {

  if ( !req.xhr ) return next();

  console.log( req );
  console.log( res );

}


function updateProfile( req, res, next ) {

  if ( !req.xhr ) return next();


}


function changeEmail( req, res, next ) {

  if ( !req.xhr ) return next();

  //

}


function changePassword( req, res, next ) {

  if ( !req.xhr ) return next();

  //

}