'use strict';

const errors = require('@feathersjs/errors');

module.exports = function replaceIdMe() {
  return async (context, next) => {
    if (context.id !== 'me') {
      return next();
    }

    if (!context.params.user || !context.params.user.uid) {
      throw new errors.NotAuthenticated('You should be logged');
    }

    context.id = context.params.user.uid;

    await next();
  };
};
