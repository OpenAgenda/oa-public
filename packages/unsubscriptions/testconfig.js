export default {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_unsubscriptions',
    password: 'grut',
    user: 'root',
    jsonStrings: true,
    ssl: { rejectUnauthorized: false },
  },
  schemas: {
    unsubscription: 'unsubscription',
    unsubscriptionLink: 'unsubscription_link',
  },
};
