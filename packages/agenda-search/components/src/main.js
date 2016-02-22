"use strict";

var React = require( 'react' ),

ReactDom = require( 'react-dom' ),

du = require( 'dom-utils' ),

dl = require( 'dom-utils/documentLocation' ),

utils = require( 'utils' ),

Body = require( './Body' );

module.exports = function( options ) {

  var params = utils.extend( {
    res: '/', // where to fetch list.
    canvas: '.js_canvas',
    dataTag: 'data-options'
  }, options ),

  data = parseTag( 'body', params.dataTag, {
    agendas: [],
    total: 0
  } );

  ReactDom.render( React.createElement( Body, {
    res: params.res,
    query: dl.getQueryPart( 'oas', {} ),
    page: parseInt( dl.getQueryPart( 'page', 1 ), 10 ),
    agendas: data.agendas,
    total: data.total
  } ), du.el( params.canvas ) );

}

function parseTag( selector, tagName, defaultValue ) {

  var data = defaultValue;

  try {

    data = JSON.parse( du.el( selector ).getAttribute( tagName ) );

  } catch( e ) {}

  return data;

}