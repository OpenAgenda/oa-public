'use strict';

const errors = require('@feathersjs/errors');

module.exports = function restrictToUnlogged() {
  return context => {
    if (context.params.user) {
      throw new errors.Forbidden(`You must not be logged in.`);
    }
  };
};
