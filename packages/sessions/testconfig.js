export default {
  sessionCookie: {
    name: 'oa',
    keys: ['dsqfdsq', 'fdqfdsqfdsf', 'dsfdss'],
    maxAge: 1000 * 60 * 60 * 48, // 2 days
    signed: true,
    secure: false,
    sameSite: 'Lax',
  },
  expire: 60 * 60 * 48,
  userCookie: {
    name: 'oa.user',
    secure: true,
    sameSite: 'Lax',
  },
  cultures: ['fr', 'en', 'es'],
  redis: {
    host: 'localhost',
    port: 6379,
    prefix: 'sessionstest',
  },
  interfaces: {
    getUser: (query, cb) => {
      cb(null, {
        id: 1,
        uid: 12345678,
        isNew: false,
        name: 'Gaetan Latouche',
        thumbnail: '//graph.facebook.com/100002280111541/picture',
        email: 'gaetan@cibul.net',
        culture: 'fr',
        ...query,
      });
    },
  },
};
