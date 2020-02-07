'use strict';

const _ = require('lodash');
const { alterItems } = require('feathers-hooks-common');
const crypto = require('../utils/crypto');

module.exports = function generateHash(field) {
  return alterItems(rec => _.set(rec, field, crypto.randomHash()));
};
