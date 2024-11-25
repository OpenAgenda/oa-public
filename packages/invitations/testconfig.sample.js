export default {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_invitations',
    password: 'grut',
    user: 'root',
    ssl: true,
  },
  schemas: {
    invitation: 'invitation',
  },
  interfaces: {
    onAssign: (action, invitation, cb) => cb(null),
  },
};
