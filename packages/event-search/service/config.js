"use strict";

const config = {};

const extend = require( 'lodash/extend' );

const elasticsearch = require( 'elasticsearch' );

let client;

module.exports.get = () => {

  if ( Object.keys( config ) === 0 ) {

    throw new Error( 'Service has not been initialized' );

  }

  return config;

}

module.exports.init = c => { 

  extend( config, c, {
    client: _createClient( c.elasticsearch ),
    type: 'event'
  } );

};

function _createClient( esConfig ) {

  if ( client ) return client;

  client = new elasticsearch.Client( esConfig );

  return client;

}