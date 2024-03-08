'use strict';

const errors = require('@feathersjs/errors');

module.exports = function verifyHeadersPassword() {
  return async context => {
    if (!await context.self.verifyPassword(
      context.headers.authorization.replace(/^Basic\s/, ''),
      { query: { email: context.params.user.email } },
    )) {
      throw new errors.Forbidden('Password is invalid.');
    }
  };
};
