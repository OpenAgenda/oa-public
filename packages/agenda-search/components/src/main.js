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
    canvas: '.js_search_canvas',
    dataTag: 'data-options',
    lang: 'en'
  }, options );

  var data = du.parseJsonAttribute( 'body', params.dataTag, {
    agendas: [],
    total: 0
  } );

  ReactDom.render( React.createElement( Body, {
    res: params.res,
    lang: params.lang,
    query: dl.getQuery(),
    page: parseInt( dl.getQueryPart( 'page', 1 ), 10 ),
    agendas: data.agendas,
    total: data.total
  } ), du.el( params.canvas ) );

}