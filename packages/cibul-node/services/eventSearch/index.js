"use strict";

const eventSearch = require( 'event-search' );

const rebuild = require( './rebuild' );

module.exports.init = config => {

  eventSearch.init( {

    elasticsearch: {
      //host: 'localhost:9206',
      host: 'https://search-events-pd273bmnqmghxp47oqreuzzlfi.eu-west-1.es.amazonaws.com',
      apiVersion: '5.3'
    },

    interfaces: {}

  } );

  rebuild.init( config );

}