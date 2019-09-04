"use strict";

var svc;

module.exports = function( locationService ) {

  svc = locationService;

  return {
    load: loadLocation
  }

}

function loadLocation( paramName, fieldName ) {

  if ( typeof fieldName == 'undefined' ) {

    fieldName = paramName;

  }

  return function( req, res, next ) {

    var getParams = {};

    getParams[ fieldName ] = req.params[ paramName ];

    svc.get( getParams, function( err, l ) {

      if ( err ) {

        if ( err == 'location not found' ) {

          return next( { code: 404 } );

        } else {

          return next( new Error( 'location service error' ) );

        }

      }

      req.location = l;

      next();

    } );

  };

}
