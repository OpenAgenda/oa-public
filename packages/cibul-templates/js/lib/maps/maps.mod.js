"use strict;"

var types = {},

ROADMAP = 'roadmap',

libs = {};

module.exports = {
  use: function( type, options ) {

    if (!types[type]) types[type] = init( type, options );

    return types[type];

  },
  register: function( type, lib ) {

    libs[type] = lib;

  }
};

var init = function( type, libOptions ) {

  if ( !libs[type] ) throw 'map type unknown';

  var lib = libs[type];

  if ( lib.init ) lib.init( libOptions );

  return lib;

};