"use strict";

const eventSearch = require( 'event-search' );

const rebuild = require( './rebuild' );

module.exports.init = config => {

  eventSearch.init( {

    elasticsearch: {
      host: 'http://ns397902.ip-151-80-41.eu:9200/',
      apiVersion: '5.3'
    },

    interfaces: {}

  } );

  rebuild.init( config );

}