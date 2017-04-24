"use strict";

module.exports = {

  elasticsearch: {
    host: 'localhost:9205',
    //log: 'trace'
  },


  interfaces: {
    locationsList: require( './test/service/locationsList' )
  },


  // for testing - not to be used in deployment / integration
  eventService: {

    mysql : {
      host : '127.0.0.1',
      database : 'oatest_event',
      password : 'grut',
      user : 'root'
    },

    schemas: {
      event: 'event'
    },

    imagePath: '//openagendatst.s3.amazonaws.com/',

    files: {/**/},

    legacy: {/**/},

  }
}