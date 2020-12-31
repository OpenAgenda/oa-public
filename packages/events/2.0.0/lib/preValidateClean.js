'use strict';

const ih = require('immutability-helper');

module.exports = data => {
  const update = {};

  if (data?.image?.filename === null) {
    update.image = { $set: null };
  }
  
  return ih(data, update);
}