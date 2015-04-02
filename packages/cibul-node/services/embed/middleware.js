"use strict";

var svc,

parserLib = require( './parser' ),

fs = require( 'fs' ),

tblr = {
  eventItem: fs.readFileSync( __dirname + '/templates/eventItem.tblr' ).toString(),
  eventItemMapping: JSON.parse( fs.readFileSync( __dirname + '/templates/eventItem.map.json' ).toString() ),
  event: fs.readFileSync( __dirname + '/templates/event.tblr' ).toString(),
  eventMapping: JSON.parse( fs.readFileSync( __dirname + '/templates/event.map.json' ).toString() )
};

module.exports = function( embedService ) {

  svc = embedService;

  return {
    load: loadEmbed,
    renderEventItems: renderEventItems,
    renderEvent: renderEvent
  }

}


/**
 * render content of embed list, 
 * shove result in req.embed.renders.list
 */

function renderEventItems( req, res, next ) {

  if ( !req.renders ) req.renders = {};

  req.renders.eventItems = [];

  var eventItemParser = parserLib( tblr.eventItemMapping );

  eventItemParser.load( tblr.eventItem );

  req.events.forEach( function( e ) {

    req.renders.eventItems.push( eventItemParser.render( e ) );

  });

  req.renders = req.renders;

  next();

}

function renderEvent( req, res, next ) {

  var eventParser = parserLib( tblr.eventMapping );

  eventParser.load( tblr.event );

  req.render = eventParser.render( req.event );

  next();

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