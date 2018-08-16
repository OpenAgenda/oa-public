module.exports = {
  mysql: {
    database: 'oa_test_activity_apps',
    host: 'localhost',
    user: 'root',
    password: 'grut'
  },

  redis: {
    host: 'localhost',
    port: 6379
  },

  emailDestination: 'commercial@openagenda.com',

  services: {
    sessions: {
      sessionCookie: {
        name: 'oa',
        keys: [ 'k', 'e', 'y', 's' ],
        maxAge: 1000 * 60 * 60 * 48, // 2 days
        signed: true,
        secure: false,
        httpOnly: false
      },
      writableCookie: {
        maxAge: 1000 * 60 * 60 * 48,
        name: 'oa.rw' // overriden by iso configuration
      },
      expire: 60*60*48,
      redis: {
        host: 'localhost',
        port: 6379,
        hash: 'sessionstest'
      },
      interfaces: {
        getUser: ( query, cb ) => {

          cb( null, {
            id: 2,
            uid: 99999999,
            culture: 'fr',
            name: 'Kévin'
          } );

        }
      }
    }
  }
};
