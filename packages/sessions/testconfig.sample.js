"use strict";

module.exports = {
  sessionCookie: {
    name: 'oa',
    keys: [ 'dsqfdsq', 'fdqfdsqfdsf', 'dsfdss' ],
    maxAge: 1000 * 60 * 60 * 48, // 2 days
    signed: true,
    secure: false
  },
  expire: 60*60*48,
  writableCookie: {
    maxAge: 1000 * 60 * 60 * 48,
    name: 'oa.rw' // overriden by iso configuration
  },
  redis: {
    host: 'localhost',
    port: 6379,
    prefix: 'sessionstest'
  },
  interfaces: {
    getUser: ( query, cb ) => {

      cb( null, {
        id: 1,
        uid: 12345678,
        isNew: false,
        name: 'Gaetan Latouche',
        thumbnail: '//graph.facebook.com/100002280111541/picture',
        email: 'gaetan@cibul.net',
        culture: 'fr',
        ...query,
      } );

    }
  }
}
