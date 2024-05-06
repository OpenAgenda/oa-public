'use strict';

const getIndexName = require('./utils/getIndexName');

module.exports = async function clear(config, set) {
  const { client, defaultIndex } = config;

  return client.deleteByQuery({
    index: getIndexName(set, defaultIndex),
    body: {
      query: {
        term: {
          _set: set,
        },
      },
    },
  }).then(({ body }) => body);
};
