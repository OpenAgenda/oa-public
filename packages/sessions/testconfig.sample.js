"use strict";

module.exports = {
  sessionCookie: {
    name: 'oa',
    keys: [ 'k', 'e', 'y', 's' ],
    maxAge: 1000 * 60 * 60 * 48, // 2 days
    signed: true,
    secure: false
  },
  writableCookie: {
    maxAge: 1000 * 60 * 60 * 48,
    name: 'oa.rw' // overriden by iso configuration
  },
  redis: {
    host: 'localhost',
    port: 6379,
    hash: 'sessionstest'
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