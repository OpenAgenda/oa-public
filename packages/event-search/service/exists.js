'use strict';

const getIndexName = require('../utils/getIndexName');

module.exports = async (config, set, options = {}) => {
  const {
    client,
    defaultIndex
  } = config;

  const index = getIndexName(set, defaultIndex);

  return client.indices.exists({
    index
  }).then(r => r.body);
}
