"use strict";

module.exports = translate;

translate.init = init;

let context, config;

function translate( cb ) {

  if ( !config ) return cb();

  console.log( config );

  cb();

}

function init( ctx, c ) {

  context = ctx;
  config = c;

}