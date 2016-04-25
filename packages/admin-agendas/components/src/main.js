"use strict";

var React = require( 'react' ),

  ReactDom = require( 'react-dom' ),

  du = require( 'dom-utils' ),

  dl = require( 'dom-utils/documentLocation' ),

  utils = require( 'utils' ),

  Body = require( './Body' );

module.exports = function( options ) {

  var params = utils.extend( {
    searchRes: '/',
    stakeholdersRes: '/stakeholders/',
    canvas: '.js_canvas'
  }, options );

  ReactDom.render( React.createElement( Body, {
    searchRes: params.searchRes,
    stakeholdersRes: params.stakeholdersRes,
  } ), du.el( params.canvas ) );
};