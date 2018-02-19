"use strict";

module.exports = {

  elasticsearch: {
    host: 'localhost:9205',
    //log: 'trace'
  },

  interfaces: {},

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

    interfaces: {
      getOriginAgendas: ( uids, cb ) => {

        cb( null, uids.map( uid => ( {
          uid,
          title: 'La Gargouille',
          image: null,
          offical: true
        } ) ) );

      },
      getLocations: require( './test/service/locationsList' )
    },

    imagePath: '//openagendatst.s3.amazonaws.com/',

    files: {/**/},

    legacy: {/**/},

  }
}