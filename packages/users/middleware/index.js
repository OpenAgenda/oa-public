"use strict";

var logger = require( 'basic-logger' ), log,

  validators = require( 'validators' ),

  React = require( 'react' ),

  ReactDOMServer = require( 'react-dom/server' ),

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

  service.get( req.user, ( err, user ) => {

    if ( err ) return next( err );

    res.json( { user } );

  } );

}


function updateProfile( req, res, next ) {

  if ( !req.xhr ) return next();

  service.updateProfile( Object.assign( {}, req.query, req.user ), ( err, result ) => {

    if ( err ) return next( err );

    res.json( result );

  } );

}


function changeEmail( req, res, next ) {

  if ( !req.xhr ) return next();

  console.log( { id: req.user.id, password: req.query.password } );

  service.verifyPassword( { id: req.user.id, password: req.query.password }, ( err, goodPassword ) => {

    if ( !goodPassword ) return res.json( {
      errors: [ {
        field: 'password',
        code: 'password.badpassword',
        message: 'bad password'
      } ],
      success: false,
      valid: false
    } );

    service.requestChangeEmail( Object.assign( {}, req.query, req.user ), ( err, result ) => {

      if ( err ) return next( err );

      delete result.token;

      res.json( result );

    } );

  } );

}


function changePassword( req, res, next ) {

  if ( !req.xhr ) return next();

  service.verifyPassword( { id: req.user.id, password: req.query.old_password }, ( err, goodPassword ) => {

    if ( !goodPassword ) {
      return res.json( {
        errors: [ {
          field: 'old_password',
          code: 'password.badpassword',
          message: 'bad password'
        } ],
        success: false,
        valid: false
      } );
    }

    if ( req.query.new_password !== req.query.confirmation ) {

      return res.json( {
        errors: [ {
          field: 'confirmation',
          code: 'confirmation.differentpassword',
          message: 'password different confirmation',
          origin: req.query.confirmation
        } ],
        success: false,
        valid: false
      } );

    }

    service.changePassword( { id: req.user.id, password: req.query.new_password }, ( err, result ) => {

      if ( err ) return next( err );

      res.json( result );

    } );

  } );

}