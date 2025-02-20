export default {
  mysql: {
    host: '127.0.0.1',
    database: 'oatest_custom',
    password: 'grut',
    user: 'root',
    ssl: true,
  },

  schemas: {
    custom: 'custom',
  },

  interfaces: {
    onCreate: () => {},

    onUpdate: () => {},

    onRemove: () => {},

    getValidator: async (_formSchemaId) => null, // should be a validator
  },
};
