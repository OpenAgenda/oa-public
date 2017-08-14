"use strict";

const eventSearch = require( 'event-search' );

const rebuild = require( './rebuild' );

const assemble = require( './assemble' );

module.exports.init = config => {

  eventSearch.init( {

    elasticsearch: {
      host: `http://ns397902.ip-151-80-41.eu:${process.env.NODE_ENV==='production' ? '9200' : '9205'}/`,
      apiVersion: '5.3'
    },

    interfaces: {}

  } );

  assemble.init( config );

}