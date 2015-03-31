"use strict";

var svc,

parserLib = require( './parser' );

module.exports = function( embedService ) {

  svc = embedService;

  return {
    load: loadEmbed,
    renderEventItems: renderEventItems
  }

}


/**
 * render content of embed list, 
 * shove result in req.embed.renders.list
 */

function renderEventItems( req, res, next ) {

  if ( !req.renders ) req.renders = {};

  req.renders.eventItems = [];

  var eventItemParser = parserLib({
    attributes: [
      { name: 'Title', mapTo: 'title' },
      { name: 'Description', mapTo: 'description' }
    ],
    children: [
      { 
        name: 'Locations',
        mapTo: 'locations',
        attributes: [
          { name: 'Name', mapTo: 'name' },
          { name: 'City', mapTo: 'city' }
        ]
      }
    ]
  });

  // what to do for links?
  // should be fed as variable ( eventLink )

  eventItemParser.load( [
    '<li>',
      '<div>{Title}</div>',
      '<p>{Description}</p>',
      '{block:Locations}',
        '<p>{Name}</p><span>{City}</span>',
      '{/block:Locations}',
    '</li>'
  ].join('') );

  req.templateData.events.forEach( function( e ) {

    req.renders.eventItems.push( eventItemParser.render( e ) );

  });

  req.templateData.renders = req.renders;

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