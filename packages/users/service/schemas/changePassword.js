'use strict';

module.exports = {
  password: {
    optional: false,
    type: 'text',
    min: 4,
  },
  confirmation: {
    type: 'text',
  },
  oldPassword: {
    type: 'text',
  },
};
