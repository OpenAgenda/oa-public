"use strict";

var genUrl = require( './genUrl' ),

singleton;

module.exports = function() {

  return singleton.apply( null, Array.prototype.slice.call( arguments ) );

}

module.exports.init = function( config ) {

  singleton = genUrl( config );

  return singleton;

}

module.exports.getSingleton = function() {

  return singleton;

}

module.exports.abs = function( uri, query ) {

  return singleton( uri, query , {
    abs: true, 
    protocol: 'https://'
  });

}