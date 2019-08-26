'use strict';

module.exports = function restrictToUnlogged() {
  return context => {
    if (context.params.user) {
      throw new errors.Forbidden(`You must not be logged in.`);
    }
  };
};
