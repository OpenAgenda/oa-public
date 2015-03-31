"use strict";

var svc,

parserLib = require( './parser' );

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

  req.rendered = '<ul>';

  eventItemParser.load( [
    '<li>',
      '<div>{Title}</div>',
      '<p>{Description}</div>',
      '{block:Locations}',
        '<p>{Name}</p><span>{City}</span>',
      '{/block:Locations}',
    '</li>'
  ].join('') );

  req.templateData.events.forEach( function( e ) {

    console.log( e );

    req.rendered += eventItemParser.render( e );

  });

  req.rendered += '</ul>';

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