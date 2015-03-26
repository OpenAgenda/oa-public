"use strict";

var svc;

module.exports = function( embedService ) {

  svc = embedService;

  return {
    load: loadEmbed,
    renderList: renderList
  }

}


/**
 * render content of embed list, 
 * shove result in req.embed.renders.list
 */

function renderList( req, res, next ) {

  // assuming the embed is loaded at this point
  
  req.embed.renderList( req.events, function( err, render ) {

    if ( err ) return next( err );

    req.embed.renders = req.embed.renders ? req.embed.renders : {};

    req.embed.renders.list = render;

    next();

  });

}

function loadEmbed( paramName, fieldName ) {

  if ( typeof fieldName == 'undefined' ) {

    fieldName = paramName;

  }

  return function( req, res, next ) {

    var getParams = {};

    getParams[ fieldName ] = req.params[ paramName ];

    svc.get( getParams, function( err, e ) {

      if ( err ) return next( 'embed service error' );

      req.embed = e;

      next();

    } );

  }

}