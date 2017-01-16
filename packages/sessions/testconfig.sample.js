"use strict";

module.exports = {
  sessionCookie: {
    name: false, // overriden by iso configuration
    keys: [ 'dsqfdsq', 'fdqfdsqfdsf', 'dsfdss' ],
    maxAge: 1000 * 60 * 60 * 48, // 2 days
    signed: true,
    secure: false
  },
  redis: {
    host: 'localhost',
    port: 6379,
    prefix: 'sessiontests:'
  },
  interfaces: {
    getUser: ( query, cb ) => {

      cb( null, {
        id: 1,
        uid: 12345678,
        name: 'Gaetan Latouche',
        thumbnail: '//graph.facebook.com/100002280111541/picture',
        email: 'gaetan@cibul.net',
        culture: 'fr'
      } );

    }
  }
}