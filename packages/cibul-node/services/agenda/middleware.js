"use strict";

var svc;

module.exports = function( agendaService ) {

  svc = agendaService;

  return {
    load: loadAgenda
  }

}






/**
 * load agenda instance and set it in req.agenda
 */

function loadAgenda( paramName, fieldName ) {

  if ( typeof fieldName == 'undefined' ) {

    fieldName = paramName;

  }

  return function( req, res, next ) {

    var getParams = {};

    getParams[ fieldName ] = req.params[ paramName ];

    svc.get( getParams, function( err, a ) {

      if ( err ) return next( 'agenda service error' );

      req.agenda = a;

      next();

    } );

  }

}